const Allocation = require('../models/Allocation');
const Application = require('../models/Application');
const Room = require('../models/Room');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { isValidId } = require('../utils/helpers');
const {
  getOccupiedCount,
  getOccupiedBedNumbers,
} = require('../services/occupancyService');

const allocationPopulate = [
  { path: 'student', select: 'name email studentId department year phone gender' },
  {
    path: 'room',
    populate: { path: 'hostel', select: 'name type location' },
  },
  { path: 'application', select: 'preferredRoomType status' },
  { path: 'allocatedBy', select: 'name email phone' },
];

const createAllocation = asyncHandler(async (req, res) => {
  isValidId(req.body.application, 'application');
  isValidId(req.body.room, 'room');

  const bedNumber = Number(req.body.bedNumber);
  if (!Number.isInteger(bedNumber) || bedNumber < 1) {
    throw new AppError('A valid bed number is required.', 400);
  }

  const application = await Application.findById(req.body.application).populate('student');
  if (!application) {
    throw new AppError('Application not found.', 404);
  }
  if (application.status !== 'Approved') {
    throw new AppError('Only approved applications can be allocated a room.', 400);
  }

  const existingAllocation = await Allocation.findOne({
    student: application.student._id,
    status: 'Active',
  });
  if (existingAllocation) {
    throw new AppError('This student already has an active allocation.', 400);
  }

  const room = await Room.findById(req.body.room).populate('hostel');
  if (!room) {
    throw new AppError('Room not found.', 404);
  }
  if (room.status !== 'Active' || !room.hostel?.isActive) {
    throw new AppError('The selected room is not available.', 400);
  }
  if (bedNumber > room.capacity) {
    throw new AppError('Bed number is outside this room capacity.', 400);
  }

  const occupiedBeds = await getOccupiedCount(room._id);
  if (occupiedBeds >= room.capacity) {
    throw new AppError('This room is already at full capacity.', 400);
  }

  const occupiedBedNumbers = await getOccupiedBedNumbers(room._id);
  if (occupiedBedNumbers.includes(bedNumber)) {
    throw new AppError('This bed is already occupied.', 400);
  }

  const allocation = await Allocation.create({
    student: application.student._id,
    room: room._id,
    bedNumber,
    application: application._id,
    allocatedBy: req.user._id,
    allocationDate: new Date(),
    status: 'Active',
  });

  await allocation.populate(allocationPopulate);
  return sendResponse(res, 201, 'Room allocated successfully.', { allocation });
});

const getMyAllocation = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findOne({
    student: req.user._id,
    status: 'Active',
  }).populate(allocationPopulate);

  return sendResponse(res, 200, 'Allocation loaded.', { allocation });
});

const getAllocations = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const allocations = await Allocation.find(filter)
    .populate(allocationPopulate)
    .sort({ allocationDate: -1 });

  return sendResponse(res, 200, 'Allocations loaded.', { allocations });
});

const cancelAllocation = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'allocation');

  const allocation = await Allocation.findById(req.params.id);
  if (!allocation) {
    throw new AppError('Allocation not found.', 404);
  }
  if (allocation.status !== 'Active') {
    throw new AppError('This allocation is already cancelled.', 400);
  }

  allocation.status = 'Cancelled';
  await allocation.save();
  await allocation.populate(allocationPopulate);

  return sendResponse(res, 200, 'Allocation cancelled.', { allocation });
});

module.exports = {
  createAllocation,
  getMyAllocation,
  getAllocations,
  cancelAllocation,
};
