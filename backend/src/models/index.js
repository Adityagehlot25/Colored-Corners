const sequelize = require('../config/database');

// 1. Import all individual models
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Review = require('./Review');

// 2. Define Relationships (The Associations)

// User <-> Order (One-to-Many)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> OrderItem (One-to-Many)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product <-> OrderItem (One-to-Many)
// This lets us easily fetch which product belongs to an order item
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// --- NEW: Cart Relationships ---

// A Cart belongs to a User (if they are logged in)
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A Cart has many CartItems
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// A CartItem belongs to a Product (so we can fetch product details inside the cart)
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItemDetails' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// --- NEW: Review Relationships ---

// Product <-> Review (One-to-Many)
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Review (One-to-Many)
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 3. Export everything centrally
module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Review
};