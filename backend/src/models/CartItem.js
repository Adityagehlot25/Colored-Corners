const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  // Links back to the Cart table
  cartId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  // Links to the Product table
  productId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  // How many they want to buy
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'cart_items'
});

module.exports = CartItem;