const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productSnapshot: {
    name: String,
    image: String,
    price: Number,
    description: String,
    contents: [String]
  },
  customizationSnapshot: {
    recipientName: String,
    birthdayDate: String,
    age: Number,
    gender: String,
    favoriteColor: String,
    theme: String,
    personalMessage: String,
    giftPreferences: String,
    thingsToAvoid: String,
    photoUrl: String
  },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true }
});

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // DDMB-2026-XXXXX
    orderId: { type: String, required: true, unique: true }, // Same as orderNumber for compatibility
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    deliveryAddressSnapshot: {
      fullName: String,
      mobileNumber: String,
      houseNo: String,
      street: String,
      area: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      landmark: String,
      addressType: String,
      latitude: Number,
      longitude: Number
    },
    pricing: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      advanceAmount: { type: Number, required: true },
      amountPaid: { type: Number, required: true },
      remainingBalance: { type: Number, required: true }
    },
    // Top-level pricing fields for easy querying / backwards compatibility:
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    totalAmount: { type: Number, required: true },
    advanceAmount: { type: Number, required: true, default: 0 },
    advancePaid: { type: Number, default: 0 }, // Same as amountPaid
    amountPaid: { type: Number, required: true, default: 0 },
    remainingBalance: { type: Number, required: true, default: 0 },
    remainingCodAmount: { type: Number, default: 0 }, // For backward compatibility with old records

    paymentInfo: {
      method: { type: String, enum: ['ADVANCE', 'FULL'], required: true },
      provider: { type: String, default: 'CASHFREE' },
      status: { type: String, enum: ['PAID', 'PARTIALLY_PAID', 'PENDING', 'FAILED'], default: 'PAID' },
      paymentOrderId: { type: String, unique: true, sparse: true },
      paymentSessionId: { type: String, default: '' },
      transactionId: { type: String, default: '' }
    },
    orderStatus: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'SCREENSHOT_SUBMITTED',
        'PAYMENT_VERIFICATION',
        'PAYMENT_COMPLETED',
        'ORDER_CONFIRMED',
        'ORDER PLACED',
        'PAYMENT VERIFIED',
        'CONFIRMED',
        'Order Confirmed', // Compatibility
        'Preparing',
        'PREPARING',
        'Packed',
        'PACKED',
        'Shipped',
        'SHIPPED',
        'Out for Delivery',
        'OUT FOR DELIVERY',
        'Delivered',
        'DELIVERED',
        'Cancelled',
        'CANCELLED'
      ],
      default: 'PENDING_PAYMENT'
    },
    shipment: {
      status: { type: String, default: 'NOT_CREATED' },
      provider: { type: String, default: null },
      shipmentId: { type: String, default: null },
      awb: { type: String, default: null },
      trackingUrl: { type: String, default: null }
    },
    trackingHistory: [trackingEventSchema],
    expectedDeliveryDate: { type: Date },
    luckyRewardUnlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
