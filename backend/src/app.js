const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const createCompressionMiddleware = require('./middleware/compressionMiddleware');
const performanceMonitor = require('./utils/performanceMonitor');

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware (must be early in the chain)
app.use(createCompressionMiddleware());

// Performance monitoring (must be early to track all requests)
if (process.env.NODE_ENV !== 'test') {
  app.use(performanceMonitor.trackRequest());
}

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ToolChess Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Performance metrics endpoint (admin only in production)
app.get('/metrics', (req, res) => {
  // In production, this should be protected with admin authentication
  if (process.env.NODE_ENV === 'production' && !req.headers['x-admin-key']) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied'
      }
    });
  }

  const report = performanceMonitor.generateReport();
  res.json({
    success: true,
    data: report
  });
});

// API Routes will be added here
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/premium', require('./routes/premiumRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
