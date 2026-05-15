const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const data = await Product.findAll();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;