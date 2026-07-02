require('dotenv').config();
require('./src/models');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./src/config/database');

const paymentRoutes = require('./src/routes/paymentRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const { globalLimiter } = require('./src/middlewares/rateLimiter');
const cartRoutes = require('./src/routes/cartRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();

// --- SECURITY & BODY PARSERS ---
app.use(helmet()); 
app.use(cors());

// Parses incoming JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- RESOLVED ROUTES ---
app.use('/payments', paymentRoutes);
app.use('/orders', orderRoutes);
app.use('/auth', authRoutes);

// Combined the dev rate-limiters with your new feature routes!
app.use('/products', globalLimiter, productRoutes);
app.use('/cart', globalLimiter, cartRoutes);
app.use('/admin', adminRoutes);
app.use('/reviews', reviewRoutes);


// Quick Health Check Route
app.get('/ping', (req, res) => {
  res.status(200).send('Server is alive and breathing! 🏓');
});

// Avoid Port 5000! Let's use 8080 instead.
const PORT = 8080;

// --- THE BULLETPROOF BOOT SEQUENCE ---
const startServer = async () => {
  try {
    console.log('⏳ Attempting to connect to PostgreSQL...');
    await sequelize.authenticate();
    console.log('🐘 PostgreSQL connected successfully!');

    console.log('⏳ Synchronizing database schemas...');
    await sequelize.sync({ alter : true }); 
    console.log('🗄️ Database schemas synchronized!');

    // Only start the server IF the database connects successfully
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server locked and loaded on http://localhost:${PORT}`);
    });

    // Catch specific port conflicts
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`🔥 ERROR: Port ${PORT} is already in use by another program!`);
        process.exit(1);
      } else {
        console.error('🔥 Server Error:', err);
      }
    });

  } catch (error) {
    console.error('❌ FATAL BOOT ERROR:', error.message);
    console.error('Did you start your PostgreSQL server? Check your .env DATABASE_URL!');
    process.exit(1);
  }
};

startServer();