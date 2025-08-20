const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Load environment variables from .env
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const therapistRoutes = require('./routes/theapist.js');
const chatRoutes = require('./routes/chatRoute.js')
const learnerRoutes = require('./routes/learnerRoutes.js')

// Import Sequelize and DB initialization
const { sequelize, initializeDatabase } = require('./models/index.js'); // ✅ Added initializeDatabase

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // or specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-role'] // Add your custom headers here
}));
app.use(express.static('./'));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());


// Test DB connection
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connected successfully.');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

// Sync models and initialize roles/admin
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log('✅ All models synchronized successfully.');
    return initializeDatabase(); // ✅ Initialize roles & default admin
  })
  .catch((err) => {
    console.error('❌ Error syncing models:', err);
  });

// Base route
app.get('/', (req, res) => {
  res.send('🌐 API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/chat', chatRoutes)
app.use('/api/learner', learnerRoutes)

// Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error('Full error:', err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: 'Server error',
//     error: err.message || 'Unknown error',
//   });
// });

module.exports = app;
