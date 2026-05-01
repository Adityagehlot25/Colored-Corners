const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

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
  },
  emailStatus: {
    type: DataTypes.STRING,
    defaultValue: 'UNVERIFIED',
    allowNull: false,
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verificationTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // --- MOVED THESE FIELDS HERE INTO THE ATTRIBUTES OBJECT ---
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  // --- OPTIONS OBJECT (3rd argument) ---
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeValidate: (user) => {
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    },
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash') && user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    }
  }
});

User.prototype.isValidPassword = async function(passwordAttempt) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(passwordAttempt, this.passwordHash);
};

module.exports = User;