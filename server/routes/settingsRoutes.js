const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.get('/admin', protect, admin, getSettings);
router.put('/', protect, admin, updateSettings);
router.put('/admin', protect, admin, updateSettings);

module.exports = router;
