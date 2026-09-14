const mongoose = require('mongoose');
const AppError = require('./AppError');

const isValidId = (id, label = 'record') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label} ID.`, 400);
  }
};

const ROOM_TYPES = ['Single Sharing', 'Double Sharing', 'Triple Sharing', 'Four Sharing'];

const roomTypeCapacity = {
  'Single Sharing': 1,
  'Double Sharing': 2,
  'Triple Sharing': 3,
  'Four Sharing': 4,
};

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

module.exports = {
  isValidId,
  ROOM_TYPES,
  roomTypeCapacity,
  isBlank,
};
