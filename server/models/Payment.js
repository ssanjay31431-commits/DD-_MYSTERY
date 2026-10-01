const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderId: {
      type: String,
      required: true,
      index: true
    },
    cashfreeOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customerDetails: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    deliveryAddressSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productSnapshot: {
          name: { type: String, default: '' },
          image: { type: String, default: '' },
          price: { type: Number, default: 0 },
          description: { type: String, default: '' },
          contents: { type: Array, default: [] }
        },
        customizationSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ],
    pricing: {
      subtotal: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      advanceAmount: { type: Number, default: 0 },
      amountPaid: { type: Number, default: 0 },
      remainingBalance: { type: Number, default: 0 }
    },
    couponCode: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
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
      default: ''
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
