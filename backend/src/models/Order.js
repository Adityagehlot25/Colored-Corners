const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path if your DB config is elsewhere

const Order = sequelize.define('Order', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  amount: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  shippingAddress: { 
    type: DataTypes.JSON, // Stores the structured address (street, city, zip)
    allowNull: true // Set to true for now so it doesn't break your existing test rows!
  },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'PENDING' // BR-ORD-01: Strict State Machine starts here
  },
  rzpOrderId: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  rzpPaymentId: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  rzpSignature: { 
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Order;