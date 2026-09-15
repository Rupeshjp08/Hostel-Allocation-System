const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    throw new AppError(
      'Server authentication is misconfigured: JWT_SECRET environment variable is missing.',
      500
    );
  }

  return secret.trim();
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
  getJwtSecret,
  createAuthToken,
  verifyAuthToken,
};
