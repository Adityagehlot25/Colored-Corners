const express = require('express');
const router = express.Router();
const ordCtrl = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/seller', protect, authorizeRoles('SELLER', 'ADMIN'), ordCtrl.getSellerOrders);
router.put('/:id/status', protect, authorizeRoles('SELLER', 'ADMIN'), ordCtrl.updateStatus);

module.exports = router;