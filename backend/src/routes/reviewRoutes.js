const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const reviewController = require('../controllers/reviewController');

// Add a new review (protected - logged in users only)
router.post('/:productId/add', protect, reviewController.addReview);

// Get all reviews for a product (public)
router.get('/:productId', reviewController.getProductReviews);

module.exports = router;
