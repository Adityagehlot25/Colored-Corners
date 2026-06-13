const jwt = require('jsonwebtoken');
const { Cart, CartItem, Product } = require('../models');

// Helper function to resolve the user identity
const getIdentity = (req) => {
  let userId = null;
  const guestId = req.headers['x-guest-id'] || req.body.guestId;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      // Invalid token, fall back to guest or fail
    }
  }
  return { userId, guestId };
};

// 1. Fetch the active cart
exports.getCart = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    if (!userId && !guestId) return res.status(200).json({ items: [] });

    const whereClause = userId ? { userId } : { guestId };

    const cart = await Cart.findOne({
      where: whereClause,
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'pStock', 'imgs'] }]
      }]
    });

    if (!cart) return res.status(200).json({ items: [] });
    res.status(200).json(cart);

  } catch (error) {
    console.error('Cart Fetch Error:', error);
    res.status(500).json({ message: 'Failed to retrieve cart.' });
  }
};

// 2. Add or update an item in the cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const { userId, guestId } = getIdentity(req);

    if (!userId && !guestId) {
      return res.status(400).json({ message: 'A user or guest ID is required.' });
    }

    // BR-CRT-01: Verify Product exists and has sufficient stock
    const product = await Product.findByPk(productId);
    if (!product || (!product.isPre && product.pStock < quantity)) {
      return res.status(409).json({ message: `Only ${product ? product.pStock : 0} items left in stock.` });
    }

    // Find or Create the Cart
    let cart = await Cart.findOne({ where: userId ? { userId } : { guestId } });

    if (!cart) {
      // BR-CRT-02: Guest carts expire in 7 days
      cart = await Cart.create({
        userId: userId || null,
        guestId: userId ? null : guestId,
        expiresAt: userId ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });

    if (cartItem) {
      // If adding exceeds physical stock, block it
      if (cartItem.quantity + quantity > product.pStock) {
         return res.status(409).json({ message: `Cannot add more. You already have ${cartItem.quantity} in cart, and only ${product.pStock} total are available.` });
      }
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    res.status(200).json({ message: 'Item added to cart securely.' });

  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.status(500).json({ message: 'Failed to add item to cart.' });
  }
};

// 3. Update item quantity
exports.updateItemQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const { userId, guestId } = getIdentity(req);
    if (!userId && !guestId) return res.status(400).json({ message: 'Identity required' });

    const cart = await Cart.findOne({ where: userId ? { userId } : { guestId } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) return res.status(404).json({ message: 'Item not in cart' });

    const product = await Product.findByPk(productId);
    if (!product.isPre && product.pStock < quantity) {
      return res.status(400).json({ message: `Only ${product.pStock} available.` });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ message: 'Quantity updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update quantity' });
  }
};

// 4. Remove single item
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, guestId } = getIdentity(req);
    
    const cart = await Cart.findOne({ where: userId ? { userId } : { guestId } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id, productId } });
    }
    res.status(200).json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item' });
  }
};

// 5. Clear entire cart (Used after successful checkout)
exports.clearCart = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const cart = await Cart.findOne({ where: userId ? { userId } : { guestId } });
    
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};