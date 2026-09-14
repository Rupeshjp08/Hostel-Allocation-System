const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    preferredHostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Preferred hostel is required.'],
    },
    preferredRoomType: {
      type: String,
      enum: ['Single Sharing', 'Double Sharing', 'Triple Sharing', 'Four Sharing'],
      required: [true, 'Preferred room type is required.'],
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    preferences: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      required: [true, 'Application reason is required.'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ student: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index(
  { student: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['Pending', 'Approved'] } },
  }
);

module.exports = mongoose.model('Application', applicationSchema);
