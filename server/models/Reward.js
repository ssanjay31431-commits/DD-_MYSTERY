const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rewardTitle: { type: String, required: true },
    rewardType: { type: String, enum: ['coupon', 'gift', 'cashback', 'better_luck'], required: true },
    rewardCode: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    claimed: { type: Boolean, default: false },
    expiryDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reward', rewardSchema);
