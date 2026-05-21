const express = require('express');
const router = express.Router();
const ordCtrl = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/seller', protect, ordCtrl.getSellerOrders);
router.put('/:id/status', protect, ordCtrl.updateStatus);

module.exports = router;