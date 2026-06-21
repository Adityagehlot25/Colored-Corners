const express = require('express');
const router = express.Router();
// At the top of orderRoutes.js
const { checkoutLimiter } = require('../middlewares/rateLimiter');

// 1. IMPORT BOTH CONTROLLERS
const ordCtrl = require('../controllers/orderController');
const payCtrl = require('../controllers/paymentController'); // <-- NEW: The Money Handler

const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// --- CUSTOMER ROUTES ---

// 1. Create a new order & get Razorpay Order ID (Handed off to Payment Controller)
router.post('/checkout', protect,checkoutLimiter, payCtrl.initiateCheckout);

// 2. Verify Razorpay payment & deduct stock atomically (Handed off to Payment Controller)
router.post('/verify-payment', protect, payCtrl.verifyPayment);

// 3. View personal history (Stays with Order Controller)
router.get('/history', protect, ordCtrl.getCustomerOrders);


// --- SELLER / ADMIN ROUTES (Stay with Order Controller) ---

// View all applicable orders based on RBAC isolation
router.get('/seller', protect, authorizeRoles('SELLER', 'ADMIN'), ordCtrl.getSellerOrders);

// Update status (e.g., mark as SHIPPED to trigger shipping email)
router.put('/:id/status', protect, authorizeRoles('SELLER', 'ADMIN'), ordCtrl.updateStatus);

module.exports = router;