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
    orderId: { type: String, required: true, unique: true }, // DDMB-2026-XXXXX
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
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    totalAmount: { type: Number, required: true }, // Full order value
    advanceRequired: { type: Number, required: true, default: 0 }, // Advance online payment amount
    advancePaid: { type: Number, default: 0 },
    remainingCodAmount: { type: Number, required: true, default: 0 }, // Remaining amount to collect on delivery
    paymentInfo: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      method: { type: String, default: 'Advance + Cash on Delivery' },
      advanceStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
      codStatus: { type: String, enum: ['Pending', 'Collected'], default: 'Pending' }
    },
    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Advance Payment Confirmed',
        'Order Confirmed',
        'Preparing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
      ],
      default: 'Order Placed'
    },
    trackingHistory: [trackingEventSchema],
    expectedDeliveryDate: { type: Date },
    luckyRewardUnlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
