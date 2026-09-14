const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    bedNumber: {
      type: Number,
      required: [true, 'Bed number is required.'],
      min: 1,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

allocationSchema.index(
  { student: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Active' },
  }
);

allocationSchema.index(
  { room: 1, bedNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Active' },
  }
);

allocationSchema.index({ application: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);
