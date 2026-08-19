const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    orderId: {
      type: String,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    upiId: {
      type: String,
      required: true,
      default: 'david468468@airtel'
    },
    upiName: {
      type: String,
      default: 'Sagariya David S'
    },
    paymentReference: {
      type: String,
      required: true
    },
    screenshotUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'SCREENSHOT_SUBMITTED',
        'PAYMENT_VERIFICATION',
        'PAYMENT_COMPLETED',
        'REJECTED',
        'FAILED'
      ],
      default: 'PENDING_PAYMENT'
    },
    submittedAt: {
      type: Date
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
