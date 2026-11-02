const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Attempt connection to MongoDB
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend UI
app.use(express.static(path.join(__dirname, 'public')));

// Root documentation / API Info route (if requested as JSON)
app.get('/api/docs', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected / Pending';

  res.status(200).json({
    message: 'Welcome to CampusFind API - Campus Lost & Found System',
    status: 'Running',
    database: dbStatus,
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET, PUT /api/auth/profile (Protected)'
      },
      items: {
        getAll: 'GET /api/items (Query params: type, category, status, search, location, sort, page, limit)',
        getOne: 'GET /api/items/:id',
        create: 'POST /api/items (Protected)',
        update: 'PUT /api/items/:id (Protected - reporter only)',
        resolve: 'PATCH /api/items/:id/resolve (Protected)',
        delete: 'DELETE /api/items/:id (Protected - reporter only)',
        myItems: 'GET /api/items/my-items (Protected)',
        stats: 'GET /api/items/stats'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'OK',
    serverUptime: process.uptime(),
    databaseState: dbStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Middleware to verify database connectivity for API endpoints
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please configure a valid MONGO_URI in your .env file and whitelist your IP in MongoDB Atlas.'
    });
  }
  next();
};

// Mount API routes (with DB connection check)
app.use('/api/auth', checkDbConnection, require('./routes/authRoutes'));
app.use('/api/items', checkDbConnection, require('./routes/itemRoutes'));

// Custom Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(` 🚀 CampusFind Server running on port ${PORT}`);
  console.log(` 🌐 Web UI:       http://localhost:${PORT}/`);
  console.log(` 🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
