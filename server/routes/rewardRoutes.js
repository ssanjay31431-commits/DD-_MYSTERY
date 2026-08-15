const express = require('express');
const router = express.Router();
const { spinLuckyReward, getUserRewards } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/spin', spinLuckyReward);
router.get('/', getUserRewards);

module.exports = router;
