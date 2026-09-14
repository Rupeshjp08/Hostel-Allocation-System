const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Application = require('../models/Application');
const Allocation = require('../models/Allocation');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { withOccupancyList } = require('../services/occupancyService');

const getStudentDashboard = asyncHandler(async (req, res) => {
  const [application, allocation, rooms] = await Promise.all([
    Application.findOne({ student: req.user._id })
      .populate('preferredHostel', 'name type')
      .sort({ createdAt: -1 }),
    Allocation.findOne({ student: req.user._id, status: 'Active' }).populate({
      path: 'room',
      populate: { path: 'hostel', select: 'name' },
    }),
    Room.find({ status: 'Active' }).populate('hostel', 'isActive'),
  ]);

  const roomsWithOccupancy = await withOccupancyList(rooms);
  const availableRoomCount = roomsWithOccupancy.filter(
    (room) => room.hostel?.isActive && room.availableBeds > 0
  ).length;

  const notifications = [];
  if (!application) {
    notifications.push('You have not submitted a hostel application yet.');
  } else if (application.status === 'Pending') {
    notifications.push('Your application is waiting for warden review.');
  } else if (application.status === 'Approved' && !allocation) {
    notifications.push('Your application is approved. Room allocation is in progress.');
  } else if (application.status === 'Rejected') {
    notifications.push(application.remarks || 'Your application was rejected.');
  }
  if (allocation) {
    notifications.push(
      `You have been allocated ${allocation.room?.hostel?.name || 'a hostel'} room ${allocation.room?.roomNumber}.`
    );
  }

  return sendResponse(res, 200, 'Student dashboard loaded.', {
    welcomeName: req.user.name,
    applicationStatus: application?.status || 'Not submitted',
    allocationStatus: allocation ? 'Allocated' : 'Not allocated',
    preferredRoomType: application?.preferredRoomType || 'Not selected',
    availableRoomCount,
    notifications,
  });
});

const getWardenDashboard = asyncHandler(async (req, res) => {
  const [hostels, rooms, pendingApplications, approvedApplications, activeAllocations] =
    await Promise.all([
      Hostel.countDocuments(),
      Room.find({ status: 'Active' }),
      Application.countDocuments({ status: 'Pending' }),
      Application.countDocuments({ status: 'Approved' }),
      Allocation.find({ status: 'Active' }).select('room'),
    ]);

  const totalBeds = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupiedBeds = activeAllocations.length;
  const availableBeds = Math.max(totalBeds - occupiedBeds, 0);

  return sendResponse(res, 200, 'Warden dashboard loaded.', {
    totalHostels: hostels,
    totalRooms: rooms.length,
    totalBeds,
    occupiedBeds,
    availableBeds,
    pendingApplications,
    approvedApplications,
  });
});

module.exports = {
  getStudentDashboard,
  getWardenDashboard,
};
