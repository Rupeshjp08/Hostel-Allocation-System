const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { isValidId, isBlank } = require('../utils/helpers');

const hostelTypes = ['Boys', 'Girls', 'Co-ed'];

const createHostel = asyncHandler(async (req, res) => {
  if (isBlank(req.body.name) || isBlank(req.body.location) || !hostelTypes.includes(req.body.type)) {
    throw new AppError('Hostel name, type, and location are required.', 400);
  }

  const totalCapacity = Number(req.body.totalCapacity);
  if (!Number.isInteger(totalCapacity) || totalCapacity < 1) {
    throw new AppError('Total capacity must be a positive number.', 400);
  }

  const hostel = await Hostel.create({
    name: req.body.name.trim(),
    type: req.body.type,
    location: req.body.location.trim(),
    description: req.body.description?.trim() || '',
    totalCapacity,
    isActive: req.body.isActive !== false,
  });

  return sendResponse(res, 201, 'Hostel created successfully.', { hostel });
});

const getHostels = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'student' || req.query.active === 'true') {
    filter.isActive = { $ne: false };
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  const hostels = await Hostel.find(filter).sort({ name: 1 });
  return sendResponse(res, 200, 'Hostels loaded.', { hostels });
});

const updateHostel = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'hostel');

  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) {
    throw new AppError('Hostel not found.', 404);
  }

  if (req.body.name) hostel.name = req.body.name.trim();
  if (req.body.type) {
    if (!hostelTypes.includes(req.body.type)) {
      throw new AppError('Hostel type must be Boys, Girls, or Co-ed.', 400);
    }
    hostel.type = req.body.type;
  }
  if (req.body.location) hostel.location = req.body.location.trim();
  if (req.body.description !== undefined) hostel.description = req.body.description.trim();
  if (req.body.totalCapacity !== undefined) {
    const totalCapacity = Number(req.body.totalCapacity);
    if (!Number.isInteger(totalCapacity) || totalCapacity < 1) {
      throw new AppError('Total capacity must be a positive number.', 400);
    }
    hostel.totalCapacity = totalCapacity;
  }
  if (req.body.isActive !== undefined) hostel.isActive = Boolean(req.body.isActive);

  await hostel.save();
  return sendResponse(res, 200, 'Hostel updated successfully.', { hostel });
});

const deleteHostel = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'hostel');

  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) {
    throw new AppError('Hostel not found.', 404);
  }

  const roomCount = await Room.countDocuments({ hostel: hostel._id });
  if (roomCount > 0) {
    throw new AppError('This hostel still has rooms. Deactivate it instead of deleting.', 400);
  }

  await hostel.deleteOne();
  return sendResponse(res, 200, 'Hostel deleted successfully.');
});

module.exports = {
  createHostel,
  getHostels,
  updateHostel,
  deleteHostel,
};
