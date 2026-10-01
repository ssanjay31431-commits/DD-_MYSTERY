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
    currency: {
      type: String,
      default: 'INR'
    },
    cashfreeOrderId: {
      type: String,
      default: ''
    },
    cashfreePaymentId: {
      type: String,
      default: ''
    },
    paymentSessionId: {
      type: String,
      default: ''
    },
    transactionId: {
      type: String,
      default: ''
    },
    paymentReference: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      default: 'CASHFREE'
    },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PENDING',
        'SUCCESS',
        'PAID',
        'PAYMENT_COMPLETED',
        'FAILED',
        'CANCELLED',
        'EXPIRED'
      ],
      default: 'PENDING_PAYMENT'
    },
    paidAt: {
      type: Date
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
