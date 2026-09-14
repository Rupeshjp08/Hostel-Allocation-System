const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hostel name is required.'],
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['Boys', 'Girls', 'Co-ed'],
      required: [true, 'Hostel type is required.'],
    },
    location: {
      type: String,
      required: [true, 'Hostel location is required.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required.'],
      min: [1, 'Hostel capacity must be at least 1.'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hostel', hostelSchema);
