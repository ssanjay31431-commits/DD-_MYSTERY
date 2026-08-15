const express = require('express');
const router = express.Router();
const { getReviews, createReview, updateReviewStatus } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getReviews);
router.post('/', protect, createReview);
router.put('/:id/status', protect, admin, updateReviewStatus);

module.exports = router;
