const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema(
  {
    advanceType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    },
    advanceAmount: {
      type: Number,
      default: 100 // Default ₹100 advance required
    },
    codAdvanceType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    },
    codAdvanceValue: {
      type: Number,
      default: 100 // Default ₹100 advance required
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    freeDeliveryMinAmount: {
      type: Number,
      default: 499
    },
    instagramLink: {
      type: String,
      default: 'https://www.instagram.com/'
    },
    whatsappNumber: {
      type: String,
      default: '+91 00000 00000'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
