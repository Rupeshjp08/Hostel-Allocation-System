const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server authentication is not configured.', 500);
  }

  return process.env.JWT_SECRET;
};

const createAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const verifyAuthToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  createAuthToken,
  verifyAuthToken,
};
