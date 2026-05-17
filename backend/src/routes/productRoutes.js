const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middlewares/authMiddleware'); // Import your friend's auth middleware!

// 1. PUBLIC: Get all products (Used by the Customer Dashboard)
router.get('/', async (req, res) => {
  try {
    const data = await Product.findAll();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. PROTECTED: Get only the logged-in Seller's products
router.get('/seller', protect, async (req, res) => {
  try {
    // req.user.id is attached by the protect middleware
    const data = await Product.findAll({ where: { sellerId: req.user.id } });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. PROTECTED: Update Stock for a specific product
router.put('/:id/stock', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { newStock } = req.body;
    const sellerId = req.user.id;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // ENFORCE BR-CAT-03: Seller Inventory Isolation
    if (product.sellerId !== sellerId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this product.' });
    }

    product.pStock = parseInt(newStock, 10);
    
    // ENFORCE BR-CAT-02: Manage Active/Out of Stock status
    if (product.pStock === 0 && !product.isPre) {
      product.status = 'OUT_OF_STOCK';
    } else if (product.pStock > 0 && product.status === 'OUT_OF_STOCK') {
      product.status = 'ACTIVE';
    }

    await product.save();
    res.status(200).json({ message: 'Stock updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROTECTED: Create a new product
router.post('/', protect, async (req, res) => {
  try {
    // 1. EXTRACT: Pull the data out of the incoming request
    const { sku, name, desc, price, pStock, status, isPre, category, imgs } = req.body;
    
    // 2. IDENTIFY: Get the seller's ID from the decoded JWT token
    const sellerId = req.user.id;

    // 3. ENFORCE BUSINESS RULES (BR-CAT-02)
    // Rule: Cannot be ACTIVE if stock is 0, unless it's a pre-order.
    if (status === 'ACTIVE' && parseInt(pStock, 10) === 0 && !isPre) {
      return res.status(400).json({ 
        message: 'Validation Failed: Cannot set status to ACTIVE with 0 stock unless it is a Pre-order.' 
      });
    }

    // 4. CREATE: Tell Sequelize to build and save the new record
    const newProduct = await Product.create({
      sellerId,
      sku,
      name,
      desc,
      price,
      pStock,
      status,
      isPre,
      category,
      // Defaulting imgs and facets for now until we build Phase 2
      imgs: imgs || [], 
      facets: {}
    });

    // 5. RESPOND: Send the newly created product back to the frontend
    res.status(201).json({ message: 'Product created successfully!', product: newProduct });

  } catch (err) {
    // If Sequelize throws an error (like a duplicate SKU), catch it here
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;