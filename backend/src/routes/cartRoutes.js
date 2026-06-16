const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET /api/cart
router.get('/', cartController.getCart);

// POST /api/cart/add
router.post('/add', cartController.addToCart);

router.put('/update', cartController.updateItemQuantity);
router.delete('/remove/:productId', cartController.removeItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;