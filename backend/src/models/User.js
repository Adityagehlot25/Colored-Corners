const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs'); // <-- Added bcryptjs

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'CUSTOMER',
    allowNull: false,
  },
  authProvider: {
    type: DataTypes.STRING,
    defaultValue: 'local',
    allowNull: false,
  },
  oauthId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    sparse: true,
  },
  emailStatus: {
    type: DataTypes.STRING,
    defaultValue: 'UNVERIFIED',
    allowNull: false,
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeValidate: (user) => {
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    },
    // <-- NEW: Hash password before creating a new user
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    },
    // <-- NEW: Hash password if the user updates their password later
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash') && user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    }
  }
});

// <-- NEW: Instance method to easily compare passwords during login
User.prototype.isValidPassword = async function(passwordAttempt) {
  if (!this.passwordHash) return false; // Prevent checking against OAuth accounts
  return await bcrypt.compare(passwordAttempt, this.passwordHash);
};

module.exports = User;