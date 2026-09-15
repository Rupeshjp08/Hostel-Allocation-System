const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { createAuthToken, getJwtSecret } = require('../utils/token');
const { validateStudentRegister, validateLogin } = require('../utils/validateAuth');

const registerStudent = asyncHandler(async (req, res) => {
  // Validate configuration before processing
  getJwtSecret();

  const errors = validateStudentRegister(req.body);

  if (errors.length > 0) {
    throw new AppError(errors[0], 400);
  }

  const student = await User.create({
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    password: req.body.password,
    role: 'student',
    studentId: req.body.studentId.trim(),
    department: req.body.department.trim(),
    year: Number(req.body.year),
    phone: req.body.phone.trim(),
    gender: req.body.gender,
  });

  const token = createAuthToken(student);

  return sendResponse(res, 201, 'Student account created successfully.', {
    token,
    user: student.toSafeObject(),
  });
});

const login = asyncHandler(async (req, res) => {
  // Validate configuration before processing
  getJwtSecret();

  const errors = validateLogin(req.body);

  if (errors.length > 0) {
    throw new AppError(errors[0], 400);
  }

  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(req.body.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = createAuthToken(user);

  return sendResponse(res, 200, 'Logged in successfully.', {
    token,
    user: user.toSafeObject(),
  });
});

const getMe = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Current user loaded.', {
    user: req.user.toSafeObject(),
  });
});

module.exports = {
  registerStudent,
  login,
  getMe,
};
