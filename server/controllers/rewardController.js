const Reward = require('../models/Reward');
const Order = require('../models/Order');

// Possible Lucky Rewards Pool configured with weighted odds
const rewardPool = [
  { title: '₹500 Birthday Cashback Voucher', type: 'cashback', code: 'REWARD500', amount: 500, weight: 10 },
  { title: 'Free Personalized Birthday Keychain', type: 'gift', code: 'FREEKEYCHAIN', amount: 0, weight: 30 },
  { title: '₹1,000 Mega Gift Card', type: 'coupon', code: 'MEGA1000', amount: 1000, weight: 5 },
  { title: '20% OFF Next Birthday Surprise', type: 'coupon', code: 'LUCKY20', amount: 0, weight: 35 },
  { title: 'Better Luck Next Time', type: 'better_luck', code: '', amount: 0, weight: 20 }
];

// @desc Spin / Reveal Lucky Reward for an eligible order
// @route POST /api/rewards/spin
const spinLuckyReward = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const existingReward = await Reward.findOne({ order: order._id });
    if (existingReward) {
      return res.json({ message: 'Reward already claimed for this order', reward: existingReward });
    }

    // Pick random reward based on weights
    const totalWeight = rewardPool.reduce((acc, item) => acc + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let selected = rewardPool[0];

    for (const item of rewardPool) {
      if (randomNum < item.weight) {
        selected = item;
        break;
      }
      randomNum -= item.weight;
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const reward = new Reward({
      user: req.user._id,
      order: order._id,
      rewardTitle: selected.title,
      rewardType: selected.type,
      rewardCode: selected.code,
      amount: selected.amount,
      claimed: true,
      expiryDate: expiry
    });

    await reward.save();
    order.luckyRewardUnlocked = true;
    await order.save();

    res.status(201).json({ message: 'Congratulations! You revealed your Lucky Reward!', reward });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get user rewards
// @route GET /api/rewards
const getUserRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { spinLuckyReward, getUserRewards };
