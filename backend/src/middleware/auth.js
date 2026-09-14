const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAuthToken } = require('../utils/token');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new AppError('Please log in to continue.', 401);
  }

  const decoded = verifyAuthToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('This account is no longer available. Please log in again.', 401);
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
