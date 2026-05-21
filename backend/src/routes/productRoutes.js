const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

// 1. PUBLIC: Get all products
router.get('/', productCtrl.getAllProducts);

// 2. PROTECTED: Get Seller Inventory 
// (MUST be above /:id so 'seller' isn't mistaken for a product ID)
router.get('/seller', protect, productCtrl.getSellerInventory);

// 3. PUBLIC: Get single product by ID (The Wildcard)
router.get('/:id', productCtrl.getProductById);

// 4. PROTECTED: Create and Update
router.post('/', protect, productCtrl.createProduct);
router.put('/:id', protect, productCtrl.updateProduct);

module.exports = router;