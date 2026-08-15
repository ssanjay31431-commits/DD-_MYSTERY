const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authProviderSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  providerId: {
    type: String,
    default: null
  }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: '' // Optional for Google Auth users
    },
    googleId: {
      type: String,
      default: null,
      index: true
    },
    profileImage: {
      type: String,
      default: ''
    },
    authProviders: [authProviderSchema],
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
