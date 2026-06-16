const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware'); // Your JWT protector
// Import the checkout rate limiter
const { checkoutLimiter } = require('../middlewares/rateLimiter');

// POST /api/payments/checkout
router.post('/checkout', protect,checkoutLimiter, paymentController.initiateCheckout);

// POST /api/payments/verify
router.post('/verify', protect,checkoutLimiter, paymentController.verifyPayment);

module.exports = router;