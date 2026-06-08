const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  // Use UUIDs for orders to prevent sequential guessing attacks by malicious users
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  
  // Link the order directly to the authenticated user
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  
  // Financial data: Stored as a DECIMAL to prevent JavaScript floating-point math errors
  amount: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  
  // Store the entire geographic address object submitted during checkout
  shippingAddress: { 
    type: DataTypes.JSON, 
    allowNull: true 
  },
  
  // BR-ORD-01: Strict Finite State Machine (FSM) Enforcement
  // We use an ENUM so the database rejects any status not in this explicit list.
  status: { 
    type: DataTypes.ENUM(
      'PENDING', 
      'PAID', 
      'PROCESSING', 
      'SHIPPED', 
      'DELIVERED', 
      'CANCELLED'
    ), 
    defaultValue: 'PENDING' 
  },
  carrier: { type: DataTypes.STRING, allowNull: true },
  trackingId: { type: DataTypes.STRING, allowNull: true },
  
  // Razorpay Specific Identifiers
  rzpOrderId: { type: DataTypes.STRING, allowNull: true },
  rzpPaymentId: { type: DataTypes.STRING, allowNull: true },
  rzpSignature: { type: DataTypes.STRING, allowNull: true }
}, {
  // Explicitly define the table name to prevent Sequelize from unexpectedly pluralizing it
  tableName: 'orders' 
});

module.exports = Order;