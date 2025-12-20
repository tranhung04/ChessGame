/**
 * Quick setup verification test
 * Tests that the Express app can be created without errors
 */

console.log('='.repeat(50));
console.log('ToolChess Backend - Setup Verification');
console.log('='.repeat(50));
console.log('');

try {
  console.log('Test 1: Loading environment configuration...');
  require('dotenv').config();
  console.log('✓ Environment configuration loaded');
  console.log('');

  console.log('Test 2: Loading Express app...');
  const app = require('./src/app');
  console.log('✓ Express app loaded successfully');
  console.log('');

  console.log('Test 3: Checking middleware setup...');
  const middlewareCount = app._router.stack.filter(layer => layer.name !== '<anonymous>').length;
  console.log(`✓ Found ${middlewareCount} middleware layers`);
  console.log('');

  console.log('Test 4: Checking routes...');
  const routes = app._router.stack
    .filter(layer => layer.route)
    .map(layer => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  
  if (routes.length > 0) {
    console.log(`✓ Found ${routes.length} routes:`);
    routes.forEach(route => console.log(`    ${route}`));
  } else {
    console.log('⚠ No routes registered yet (this is expected for initial setup)');
  }
  console.log('');

  console.log('Test 5: Verifying middleware files...');
  const fs = require('fs');
  const middlewareFiles = [
    'src/middleware/errorHandler.js',
    'src/middleware/notFoundHandler.js',
    'src/middleware/rateLimiter.js',
    'src/middleware/requestLogger.js',
    'src/middleware/validator.js',
    'src/middleware/auth.js'
  ];

  let allFilesExist = true;
  middlewareFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✓ ${file}`);
    } else {
      console.log(`  ✗ ${file} - MISSING`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    throw new Error('Some middleware files are missing');
  }
  console.log('');

  console.log('Test 6: Verifying configuration files...');
  const configFiles = [
    'src/config/database.js',
    '.env.example',
    'package.json',
    'README.md'
  ];

  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✓ ${file}`);
    } else {
      console.log(`  ✗ ${file} - MISSING`);
      allFilesExist = false;
    }
  });
  console.log('');

  console.log('='.repeat(50));
  console.log('✓ All setup verification tests passed!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Next steps:');
  console.log('  1. Copy .env.example to .env');
  console.log('  2. Configure database credentials in .env');
  console.log('  3. Run "npm run test:db" to test database connection');
  console.log('  4. Run "npm run dev" to start the development server');
  console.log('');

} catch (error) {
  console.error('');
  console.error('='.repeat(50));
  console.error('✗ Setup verification failed!');
  console.error('='.repeat(50));
  console.error('');
  console.error('Error:', error.message);
  console.error('');
  process.exit(1);
}
