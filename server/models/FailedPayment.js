const mongoose = require('mongoose');

const failedPaymentSchema = new mongoose.Schema(
  {
    paymentOrderId: { type: String, required: true, unique: true },
    paymentSessionId: { type: String },
    transactionId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userSnapshot: {
      name: String,
      email: String,
      phone: String
    },
    items: [mongoose.Schema.Types.Mixed],
    deliveryAddress: mongoose.Schema.Types.Mixed,
    pricing: {
      subtotal: Number,
      deliveryFee: Number,
      couponDiscount: Number,
      totalAmount: Number,
      advanceAmount: Number,
      amountPaid: Number,
      remainingBalance: Number
    },
    paymentMethod: { type: String, enum: ['ADVANCE', 'FULL'], default: 'ADVANCE' },
    errorDetails: { type: String, default: '' },
    status: { type: String, enum: ['UNRESOLVED', 'RESOLVED'], default: 'UNRESOLVED' },
    resolvedOrderId: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FailedPayment', failedPaymentSchema);
