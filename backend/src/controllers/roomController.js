const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { isValidId, isBlank, ROOM_TYPES, roomTypeCapacity } = require('../utils/helpers');
const {
  getOccupiedCount,
  getAvailableBedNumbers,
  withOccupancy,
  withOccupancyList,
} = require('../services/occupancyService');

const parseFacilities = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const createRoom = asyncHandler(async (req, res) => {
  isValidId(req.body.hostel, 'hostel');

  if (
    isBlank(req.body.roomNumber) ||
    isBlank(req.body.block) ||
    req.body.floor === undefined ||
    !ROOM_TYPES.includes(req.body.roomType)
  ) {
    throw new AppError('Room number, hostel, block, floor, and room type are required.', 400);
  }

  const hostel = await Hostel.findById(req.body.hostel);
  if (!hostel) {
    throw new AppError('Hostel not found.', 404);
  }

  const capacity = roomTypeCapacity[req.body.roomType];
  const floor = Number(req.body.floor);
  if (!Number.isInteger(floor) || floor < 0) {
    throw new AppError('Floor must be 0 or greater.', 400);
  }

  const room = await Room.create({
    roomNumber: req.body.roomNumber.trim(),
    hostel: hostel._id,
    block: req.body.block.trim(),
    floor,
    roomType: req.body.roomType,
    capacity,
    facilities: parseFacilities(req.body.facilities),
    status: req.body.status === 'Inactive' ? 'Inactive' : 'Active',
  });

  const populated = await room.populate('hostel', 'name type location isActive');
  return sendResponse(res, 201, 'Room created successfully.', {
    room: await withOccupancy(populated),
  });
});

const getRooms = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.hostel) {
    isValidId(req.query.hostel, 'hostel');
    filter.hostel = req.query.hostel;
  }

  if (req.query.roomType) {
    filter.roomType = req.query.roomType;
  }

  if (req.user.role === 'student') {
    filter.status = 'Active';
  } else if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    filter.roomNumber = new RegExp(req.query.search.trim(), 'i');
  }

  const rooms = await Room.find(filter)
    .populate('hostel', 'name type location isActive')
    .sort({ roomNumber: 1 });

  let roomsWithOccupancy = await withOccupancyList(rooms);

  if (req.user.role === 'student') {
    roomsWithOccupancy = roomsWithOccupancy.filter((room) => room.hostel?.isActive);
  }

  if (req.query.availability === 'available') {
    roomsWithOccupancy = roomsWithOccupancy.filter((room) => room.availableBeds > 0);
  }

  if (req.query.availability === 'full') {
    roomsWithOccupancy = roomsWithOccupancy.filter((room) => room.availableBeds === 0);
  }

  return sendResponse(res, 200, 'Rooms loaded.', { rooms: roomsWithOccupancy });
});

const getRoomById = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'room');

  const room = await Room.findById(req.params.id).populate('hostel', 'name type location isActive');
  if (!room) {
    throw new AppError('Room not found.', 404);
  }

  const roomWithOccupancy = await withOccupancy(room);
  const availableBedNumbers = await getAvailableBedNumbers(room);

  return sendResponse(res, 200, 'Room loaded.', {
    room: {
      ...roomWithOccupancy,
      availableBedNumbers,
    },
  });
});

const updateRoom = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'room');

  const room = await Room.findById(req.params.id);
  if (!room) {
    throw new AppError('Room not found.', 404);
  }

  const occupiedBeds = await getOccupiedCount(room._id);

  if (req.body.hostel) {
    isValidId(req.body.hostel, 'hostel');
    const hostel = await Hostel.findById(req.body.hostel);
    if (!hostel) {
      throw new AppError('Hostel not found.', 404);
    }
    room.hostel = hostel._id;
  }

  if (req.body.roomNumber) room.roomNumber = req.body.roomNumber.trim();
  if (req.body.block) room.block = req.body.block.trim();
  if (req.body.floor !== undefined) {
    const floor = Number(req.body.floor);
    if (!Number.isInteger(floor) || floor < 0) {
      throw new AppError('Floor must be 0 or greater.', 400);
    }
    room.floor = floor;
  }

  if (req.body.roomType) {
    if (!ROOM_TYPES.includes(req.body.roomType)) {
      throw new AppError('Invalid room type.', 400);
    }
    const nextCapacity = roomTypeCapacity[req.body.roomType];
    if (nextCapacity < occupiedBeds) {
      throw new AppError('Room capacity cannot be smaller than the current occupancy.', 400);
    }
    room.roomType = req.body.roomType;
    room.capacity = nextCapacity;
  }

  if (req.body.capacity !== undefined) {
    const capacity = Number(req.body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 4) {
      throw new AppError('Room capacity must be between 1 and 4.', 400);
    }
    if (capacity < occupiedBeds) {
      throw new AppError('Room capacity cannot be smaller than the current occupancy.', 400);
    }
    room.capacity = capacity;
  }

  if (req.body.facilities !== undefined) {
    room.facilities = parseFacilities(req.body.facilities);
  }

  if (req.body.status) {
    room.status = req.body.status === 'Inactive' ? 'Inactive' : 'Active';
  }

  await room.save();
  const populated = await room.populate('hostel', 'name type location isActive');
  return sendResponse(res, 200, 'Room updated successfully.', {
    room: await withOccupancy(populated),
  });
});

const deleteRoom = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'room');

  const room = await Room.findById(req.params.id);
  if (!room) {
    throw new AppError('Room not found.', 404);
  }

  const occupiedBeds = await getOccupiedCount(room._id);
  if (occupiedBeds > 0) {
    throw new AppError('This room still has allocated students and cannot be deleted.', 400);
  }

  await room.deleteOne();
  return sendResponse(res, 200, 'Room deleted successfully.');
});

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
