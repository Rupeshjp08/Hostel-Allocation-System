const mongoose = require('mongoose');

const roomTypes = ['Single Sharing', 'Double Sharing', 'Triple Sharing', 'Four Sharing'];

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required.'],
      trim: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Hostel is required.'],
    },
    block: {
      type: String,
      required: [true, 'Block name is required.'],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required.'],
      min: 0,
    },
    roomType: {
      type: String,
      enum: roomTypes,
      required: [true, 'Room type is required.'],
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required.'],
      min: [1, 'Room capacity must be at least 1.'],
      max: [4, 'Room capacity cannot exceed 4.'],
    },
    facilities: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ hostel: 1, roomType: 1, status: 1 });

module.exports = mongoose.model('Room', roomSchema);
