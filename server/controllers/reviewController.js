const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc Get reviews for product or all approved reviews
// @route GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const { productId } = req.query;
    const filter = { status: 'Approved' };
    if (productId) filter.product = productId;

    const reviews = await Review.find(filter).populate('user', 'name profileImage').populate('product', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a review
// @route POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment, image } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating and comment are required' });
    }

    const review = new Review({
      user: req.user._id,
      product: productId,
      order: orderId || null,
      rating,
      comment,
      image: image || '',
      isVerifiedPurchase: true,
      status: 'Approved'
    });

    const savedReview = await review.save();

    // Recalculate Product average rating
    const productReviews = await Review.find({ product: productId, status: 'Approved' });
    const avgRating = productReviews.reduce((acc, item) => item.rating + acc, 0) / productReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(avgRating.toFixed(1)),
      numReviews: productReviews.length
    });

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin moderate review
// @route PUT /api/reviews/:id/status
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);
    if (review) {
      review.status = status;
      await review.save();
      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getReviews, createReview, updateReviewStatus };
