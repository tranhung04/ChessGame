require('dotenv').config();
const app = require('./app');
const { testDatabaseConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
testDatabaseConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✓ ToolChess Backend API Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Database: Connected to ${process.env.DB_DATABASE}`);
    });
  })
  .catch((error) => {
    console.error('✗ Failed to connect to database:', error.message);
    console.error('✗ Server startup aborted');
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
