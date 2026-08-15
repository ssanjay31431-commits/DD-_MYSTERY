const express = require('express');
const router = express.Router();
const UserNotification = require('../models/UserNotification');
const { protect } = require('../middleware/authMiddleware');

// @desc Get current customer's notifications
// @route GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await UserNotification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await UserNotification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
