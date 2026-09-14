const request = async (method, path, token, body) => {
  const response = await fetch(`http://localhost:5000/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json();
  return { status: response.status, payload };
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const stamp = Date.now();

  const wardenLogin = await request('POST', '/auth/login', null, {
    email: 'warden@hostel.edu',
    password: 'ChangeThisPassword123',
  });
  assert(wardenLogin.status === 200, 'Warden login failed');
  const wardenToken = wardenLogin.payload.data.token;

  const studentRegister = await request('POST', '/auth/register', null, {
    name: 'Meera Nair',
    email: `meera.${stamp}@college.edu`,
    password: 'Password123',
    confirmPassword: 'Password123',
    studentId: `ME${stamp}`,
    department: 'Electronics',
    year: 2,
    phone: '9123456780',
    gender: 'Female',
  });
  assert(studentRegister.status === 201, 'Student register failed');
  const studentToken = studentRegister.payload.data.token;

  const forbiddenHostel = await request('POST', '/hostels', studentToken, {
    name: 'Should Fail',
    type: 'Girls',
    location: 'East Campus',
    totalCapacity: 20,
  });
  assert(forbiddenHostel.status === 403, 'Student was able to create a hostel');

  const hostel = await request('POST', '/hostels', wardenToken, {
    name: `Girls Hostel ${stamp}`,
    type: 'Girls',
    location: 'East Campus',
    description: 'Quiet residential block',
    totalCapacity: 40,
  });
  assert(hostel.status === 201, 'Hostel create failed');
  const hostelId = hostel.payload.data.hostel._id;

  const room = await request('POST', '/rooms', wardenToken, {
    roomNumber: `G-${stamp.toString().slice(-4)}`,
    hostel: hostelId,
    block: 'A',
    floor: 1,
    roomType: 'Double Sharing',
    facilities: ['WiFi', 'Attached bathroom'],
  });
  assert(room.status === 201, 'Room create failed');
  assert(room.payload.data.room.capacity === 2, 'Room capacity should follow room type');
  assert(room.payload.data.room.availableBeds === 2, 'New room should be empty');
  const roomId = room.payload.data.room._id;

  const application = await request('POST', '/applications', studentToken, {
    preferredHostel: hostelId,
    preferredRoomType: 'Double Sharing',
    reason: 'I need hostel accommodation near campus.',
    preferences: 'Lower floor if possible',
  });
  assert(application.status === 201, 'Application create failed');
  const applicationId = application.payload.data.application._id;

  const duplicateApplication = await request('POST', '/applications', studentToken, {
    preferredHostel: hostelId,
    preferredRoomType: 'Double Sharing',
    reason: 'Second attempt',
  });
  assert(duplicateApplication.status === 400, 'Duplicate application was allowed');

  const studentApprove = await request('PUT', `/applications/${applicationId}/approve`, studentToken, {
    remarks: 'Trying to self approve',
  });
  assert(studentApprove.status === 403, 'Student was able to approve an application');

  const approve = await request('PUT', `/applications/${applicationId}/approve`, wardenToken, {
    remarks: 'Documents verified',
  });
  assert(approve.status === 200, 'Approve failed');

  const overCapacity = await request('POST', '/allocations', wardenToken, {
    application: applicationId,
    room: roomId,
    bedNumber: 5,
  });
  assert(overCapacity.status === 400, 'Bed outside capacity was allowed');

  const allocate = await request('POST', '/allocations', wardenToken, {
    application: applicationId,
    room: roomId,
    bedNumber: 1,
  });
  assert(allocate.status === 201, 'Allocation failed');
  const allocationId = allocate.payload.data.allocation._id;

  const occupiedBed = await request('POST', '/allocations', wardenToken, {
    application: applicationId,
    room: roomId,
    bedNumber: 1,
  });
  assert(occupiedBed.status === 400, 'Duplicate bed allocation was allowed');

  const roomAfter = await request('GET', `/rooms/${roomId}`, wardenToken);
  assert(roomAfter.payload.data.room.occupiedBeds === 1, 'Occupancy did not update');
  assert(roomAfter.payload.data.room.availableBeds === 1, 'Available beds incorrect');

  const myAllocation = await request('GET', '/allocations/my', studentToken);
  assert(myAllocation.payload.data.allocation.bedNumber === 1, 'Student allocation missing');

  const cancel = await request('PUT', `/allocations/${allocationId}/cancel`, wardenToken);
  assert(cancel.status === 200, 'Cancel allocation failed');

  const roomAfterCancel = await request('GET', `/rooms/${roomId}`, wardenToken);
  assert(roomAfterCancel.payload.data.room.occupiedBeds === 0, 'Occupancy did not free after cancel');

  console.log('Phase 3 API checks passed');
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
