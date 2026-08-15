const mongoose = require('mongoose');
const customizationSchema = require('./Customization');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customization: customizationSchema,
  quantity: { type: Number, required: true, default: 1, min: 1 },
  unitPrice: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    couponApplied: {
      code: String,
      discountAmount: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
