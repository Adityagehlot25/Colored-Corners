const { Op } = require('sequelize');
const { sequelize, Product } = require('../models');

// 1. PUBLIC: Get all active products with Search, Filters, and Out-of-Stock sorting (BR-SRCH-01)
exports.getAllProducts = async (req, res) => {
  try {
    const { q, category } = req.query;
    const whereClause = { status: 'ACTIVE' };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { desc: { [Op.iLike]: `%${q}%` } },
        { sku: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [
        [sequelize.literal('"pStock" > 0'), 'DESC'], // True (In Stock) comes before False (Out of stock)
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Search Engine Error:', error);
    res.status(500).json({ message: 'Failed to fetch the catalogue.' });
  }
};

// 2. PUBLIC: Get a single product by ID (For the Product Detail Page)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product details.' });
  }
};

// 3. PROTECTED: Get only the logged-in seller's inventory
exports.getSellerInventory = async (req, res) => {
  try {
    const products = await Product.findAll({ 
      where: { sellerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory.' });
  }
};

// 4. PROTECTED: Create a new product
exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, sellerId: req.user.id };
    const newProduct = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'A product with this SKU already exists.' });
    }
    res.status(500).json({ message: 'Failed to create product.' });
  }
};

// 5. PROTECTED: Update an existing product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      where: { id: req.params.id, sellerId: req.user.id } // BR-CAT-03: Security check
    });
    
    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized.' });

    // BR-CAT-02: Prevent activation if stock is 0 and not a pre-order
    if (req.body.status === 'ACTIVE' && req.body.pStock == 0 && !req.body.isPre) {
      return res.status(400).json({ message: 'Cannot activate an item with 0 stock unless it is a Pre-order.' });
    }

    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product.' });
  }
};