const sequelize = require('../config/database');

// 1. Import all individual models
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

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


// 3. Export everything centrally
module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem
};