const { DataTypes } = require('sequelize');
const seq = require('../config/database');

const Product = seq.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    sellerId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    desc: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    pStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'OUT_OF_STOCK'),
        defaultValue: 'DRAFT',
    },
    isFinalSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isPre: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    imgs: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    facets: {
        type: DataTypes.JSONB,
        defaultValue: {},
    }
}, {
    timestamps: true,
    tableName: 'products',
});

module.exports = Product;