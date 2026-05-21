const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  
  // Links back to the parent Order
  orderId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  
  // Links to the specific Product
  productId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  
  // The quantity purchased
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  
  // CRITICAL: We must store the price AT THE TIME OF PURCHASE. 
  // If the product price changes tomorrow, this historic order must not change.
  priceAtPurchase: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  }
}, {
  tableName: 'order_items'
});

module.exports = OrderItem;