require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');

const app = express();

// Middlewares
app.use(helmet()); 
app.use(cors());
app.use(express.json());

// Import Models to ensure they are registered with Sequelize
const User = require('./models/User');

// Import Routes
const authRoutes = require('./routes/authRoutes');

// Mount Routes
app.use('/auth', authRoutes);

// Database Connection & Sync
sequelize.authenticate()
  .then(() => {
    console.log('🐘 PostgreSQL connected successfully');
    // In production, use migrations instead of sync()
    return sequelize.sync({ alter: true }); 
  })
  .then(() => console.log('🗄️ Database schemas synchronized'))
  .catch(err => console.error('Unable to connect to the database:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});