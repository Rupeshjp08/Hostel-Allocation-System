const AppError = require('../utils/AppError');

const getFriendlyDatabaseMessage = (error) => {
  if (error.code !== 11000) {
    return null;
  }

  const fields = Object.keys(error.keyPattern || {});

  if (fields.includes('email')) {
    return 'An account with this email already exists.';
  }

  if (fields.includes('studentId')) {
    return 'This student ID is already registered.';
  }

  return 'A record with these details already exists.';
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'The request data is invalid.',
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Your session is invalid. Please log in again.',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'The requested record could not be found.',
    });
  }

  if (error.name === 'ValidationError') {
    const firstError = Object.values(error.errors || {})[0];
    return res.status(400).json({
      success: false,
      message: firstError?.message || 'Please check the submitted details.',
    });
  }

  const duplicateMessage = getFriendlyDatabaseMessage(error);
  if (duplicateMessage) {
    return res.status(409).json({
      success: false,
      message: duplicateMessage,
    });
  }

  const statusCode = error.statusCode || 500;
  const message =
    error instanceof AppError || error.isOperational
      ? error.message
      : 'Something went wrong. Please try again later.';

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
