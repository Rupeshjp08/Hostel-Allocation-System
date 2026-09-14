const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'warden'],
      required: true,
    },
    studentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    department: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: 1,
      max: 5,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    studentId: this.studentId || null,
    department: this.department || null,
    year: this.year || null,
    phone: this.phone || null,
    gender: this.gender || null,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
