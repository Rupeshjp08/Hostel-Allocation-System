const Application = require('../models/Application');
const Allocation = require('../models/Allocation');
const Hostel = require('../models/Hostel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { isValidId, isBlank, ROOM_TYPES } = require('../utils/helpers');

const applicationPopulate = [
  { path: 'student', select: 'name email studentId department year phone gender' },
  { path: 'preferredHostel', select: 'name type location isActive' },
];

const createApplication = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    throw new AppError('Only students can submit hostel applications.', 403);
  }

  isValidId(req.body.preferredHostel, 'hostel');

  if (!ROOM_TYPES.includes(req.body.preferredRoomType) || isBlank(req.body.reason)) {
    throw new AppError('Preferred hostel, room type, and application reason are required.', 400);
  }

  const existingAllocation = await Allocation.findOne({
    student: req.user._id,
    status: 'Active',
  });
  if (existingAllocation) {
    throw new AppError('You already have an allocated room.', 400);
  }

  const activeApplication = await Application.findOne({
    student: req.user._id,
    status: { $in: ['Pending', 'Approved'] },
  });
  if (activeApplication) {
    throw new AppError('You already have an active application.', 400);
  }

  const hostel = await Hostel.findById(req.body.preferredHostel);
  if (!hostel || !hostel.isActive) {
    throw new AppError('The selected hostel is not available.', 400);
  }

  const userGender = String(req.user.gender || '').trim().toLowerCase();
  const hostelType = String(hostel.type || '').trim().toLowerCase();

  if (hostelType === 'boys' && userGender !== 'male') {
    throw new AppError('This hostel is available for male students only.', 400);
  }
  if (hostelType === 'girls' && userGender !== 'female') {
    throw new AppError('This hostel is available for female students only.', 400);
  }

  const application = await Application.create({
    student: req.user._id,
    preferredHostel: hostel._id,
    preferredRoomType: req.body.preferredRoomType,
    year: req.user.year,
    gender: req.user.gender,
    preferences: req.body.preferences?.trim() || '',
    reason: req.body.reason.trim(),
    status: 'Pending',
  });

  await application.populate(applicationPopulate);
  return sendResponse(res, 201, 'Application submitted successfully.', { application });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate(applicationPopulate)
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, 'Your applications loaded.', { applications });
});

const getApplications = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const User = require('../models/User');
    const students = await User.find({
      role: 'student',
      $or: [
        { name: new RegExp(req.query.search.trim(), 'i') },
        { email: new RegExp(req.query.search.trim(), 'i') },
        { studentId: new RegExp(req.query.search.trim(), 'i') },
      ],
    }).select('_id');

    filter.student = { $in: students.map((student) => student._id) };
  }

  const applications = await Application.find(filter)
    .populate(applicationPopulate)
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, 'Applications loaded.', { applications });
});

const getApplicationById = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'application');

  const application = await Application.findById(req.params.id).populate(applicationPopulate);
  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const isOwner = application.student._id.toString() === req.user._id.toString();
  if (req.user.role === 'student' && !isOwner) {
    throw new AppError('You are not allowed to view this application.', 403);
  }

  return sendResponse(res, 200, 'Application loaded.', { application });
});

const approveApplication = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'application');

  const application = await Application.findById(req.params.id);
  if (!application) {
    throw new AppError('Application not found.', 404);
  }
  if (application.status !== 'Pending') {
    throw new AppError('Only pending applications can be approved.', 400);
  }

  application.status = 'Approved';
  application.remarks = req.body.remarks?.trim() || 'Application approved.';
  await application.save();
  await application.populate(applicationPopulate);

  return sendResponse(res, 200, 'Application approved.', { application });
});

const rejectApplication = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'application');

  if (isBlank(req.body.remarks)) {
    throw new AppError('Please add remarks before rejecting an application.', 400);
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    throw new AppError('Application not found.', 404);
  }
  if (application.status !== 'Pending') {
    throw new AppError('Only pending applications can be rejected.', 400);
  }

  application.status = 'Rejected';
  application.remarks = req.body.remarks.trim();
  await application.save();
  await application.populate(applicationPopulate);

  return sendResponse(res, 200, 'Application rejected.', { application });
});

const cancelApplication = asyncHandler(async (req, res) => {
  isValidId(req.params.id, 'application');

  const application = await Application.findById(req.params.id);
  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  if (application.student.toString() !== req.user._id.toString()) {
    throw new AppError('You can only cancel your own application.', 403);
  }

  if (application.status !== 'Pending') {
    throw new AppError('Only pending applications can be cancelled.', 400);
  }

  application.status = 'Cancelled';
  application.remarks = req.body.remarks?.trim() || 'Cancelled by student.';
  await application.save();
  await application.populate(applicationPopulate);

  return sendResponse(res, 200, 'Application cancelled.', { application });
});

module.exports = {
  createApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  cancelApplication,
};
