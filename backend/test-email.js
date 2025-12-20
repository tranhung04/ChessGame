/**
 * Email Service Test Script
 * Tests email sending functionality
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testEmailService() {
  try {
    logSection('EMAIL SERVICE TEST');

    // Test 1: Verify SMTP Connection
    logSection('Test 1: Verify SMTP Connection');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/email/verify`);
      
      if (response.data.success) {
        log('✓ SMTP connection verified successfully', 'green');
        console.log('Response:', JSON.stringify(response.data, null, 2));
      } else {
        log('✗ SMTP connection verification failed', 'red');
        console.log('Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      log('✗ SMTP connection test failed', 'red');
      if (error.response) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
      log('\nNote: SMTP connection may fail if credentials are not configured in .env', 'yellow');
    }

    // Test 2: Send Test Verification Email
    logSection('Test 2: Send Test Verification Email');
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const response = await axios.post(`${API_BASE_URL}/api/email/test/verification`, {
        email: testEmail,
        username: 'TestUser'
      });
      
      if (response.data.success) {
        log('✓ Test verification email sent successfully', 'green');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        log(`Check inbox: ${testEmail}`, 'yellow');
      }
    } catch (error) {
      log('✗ Failed to send test verification email', 'red');
      if (error.response) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }

    // Test 3: Send Test Password Reset Email
    logSection('Test 3: Send Test Password Reset Email');
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const response = await axios.post(`${API_BASE_URL}/api/email/test/password-reset`, {
        email: testEmail,
        username: 'TestUser'
      });
      
      if (response.data.success) {
        log('✓ Test password reset email sent successfully', 'green');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        log(`Check inbox: ${testEmail}`, 'yellow');
      }
    } catch (error) {
      log('✗ Failed to send test password reset email', 'red');
      if (error.response) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }

    // Test 4: Send Test Payment Confirmation Email
    logSection('Test 4: Send Test Payment Confirmation Email');
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const response = await axios.post(`${API_BASE_URL}/api/email/test/payment-confirmation`, {
        email: testEmail,
        username: 'TestUser'
      });
      
      if (response.data.success) {
        log('✓ Test payment confirmation email sent successfully', 'green');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        log(`Check inbox: ${testEmail}`, 'yellow');
      }
    } catch (error) {
      log('✗ Failed to send test payment confirmation email', 'red');
      if (error.response) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }

    // Test 5: Send Generic Email with Custom Template
    logSection('Test 5: Send Generic Email (POST /api/email/send)');
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const response = await axios.post(`${API_BASE_URL}/api/email/send`, {
        to: testEmail,
        subject: 'Test Email from ToolChess',
        template: 'verification',
        data: {
          username: 'GenericTestUser',
          verificationLink: 'https://toolchess.com/verify?token=test123'
        }
      });
      
      if (response.data.success) {
        log('✓ Generic email sent successfully', 'green');
        console.log('Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      log('✗ Failed to send generic email', 'red');
      if (error.response) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }

    // Test 6: Test Validation - Invalid Email
    logSection('Test 6: Test Validation - Invalid Email');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/email/send`, {
        to: 'invalid-email',
        subject: 'Test',
        template: 'verification',
        data: { username: 'Test', verificationLink: 'http://test.com' }
      });
      
      log('✗ Should have failed with invalid email', 'red');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✓ Correctly rejected invalid email', 'green');
        console.log('Error response:', JSON.stringify(error.response.data, null, 2));
      } else {
        log('✗ Unexpected error', 'red');
        console.log('Error:', error.message);
      }
    }

    // Test 7: Test Validation - Invalid Template
    logSection('Test 7: Test Validation - Invalid Template');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/email/send`, {
        to: 'test@example.com',
        subject: 'Test',
        template: 'invalid-template',
        data: { username: 'Test' }
      });
      
      log('✗ Should have failed with invalid template', 'red');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✓ Correctly rejected invalid template', 'green');
        console.log('Error response:', JSON.stringify(error.response.data, null, 2));
      } else {
        log('✗ Unexpected error', 'red');
        console.log('Error:', error.message);
      }
    }

    logSection('EMAIL SERVICE TEST COMPLETED');
    log('\nNote: To actually send emails, configure SMTP settings in .env:', 'yellow');
    log('  SMTP_HOST=smtp.gmail.com', 'yellow');
    log('  SMTP_PORT=587', 'yellow');
    log('  SMTP_SECURE=false', 'yellow');
    log('  SMTP_USER=your-email@gmail.com', 'yellow');
    log('  SMTP_PASS=your-gmail-app-password', 'yellow');
    log('  SMTP_FROM=ToolChess <noreply@toolchess.com>', 'yellow');
    log('  TEST_EMAIL=your-test-email@example.com', 'yellow');
    log('\nFor Gmail App Password: https://myaccount.google.com/apppasswords', 'cyan');

  } catch (error) {
    log('\n✗ Test suite failed with unexpected error', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  log('Starting Email Service Tests...', 'blue');
  log(`API Base URL: ${API_BASE_URL}`, 'blue');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('\n✗ Server is not running!', 'red');
    log('Please start the server first: npm start', 'yellow');
    process.exit(1);
  }

  await testEmailService();
})();
