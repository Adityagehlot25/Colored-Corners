const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  // If the user is logged in
  userId: { 
    type: DataTypes.UUID, 
    allowNull: true 
  },
  // If the user is a guest (we will store this ID in their browser's localStorage)
  guestId: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  // BR-CRT-02: Guest carts expire after 7 days
  expiresAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  }
}, {
  tableName: 'carts'
});

module.exports = Cart;