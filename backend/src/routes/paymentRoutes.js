const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware'); // Your JWT protector

// POST /api/payments/checkout
router.post('/checkout', protect, paymentController.initiateCheckout);

// POST /api/payments/verify
router.post('/verify', protect, paymentController.verifyPayment);

module.exports = router;