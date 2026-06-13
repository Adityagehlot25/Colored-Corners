const express = require('express');
const router = express.Router();
const ordCtrl = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// --- CUSTOMER ROUTES ---

// 1. Create a new order & get Razorpay Order ID
router.post('/checkout', protect, ordCtrl.createOrder);

// 2. Verify Razorpay payment and trigger notifications
router.post('/verify-payment', protect, ordCtrl.verifyPayment);

// 3. View personal history
router.get('/history', protect, ordCtrl.getCustomerOrders);

// --- SELLER / ADMIN ROUTES ---

// View all applicable orders based on RBAC isolation
router.get('/seller', protect, authorizeRoles('SELLER', 'ADMIN'), ordCtrl.getSellerOrders);

// Update status (e.g., mark as SHIPPED to trigger shipping email)
router.put('/:id/status', protect, authorizeRoles('SELLER', 'ADMIN'), ordCtrl.updateStatus);

module.exports = router;