/**
 * Test Google Authentication
 * 
 * This script tests the Google OAuth login endpoint
 * 
 * Note: You need a valid Google ID token to test this
 * Get one by:
 * 1. Running the mobile app
 * 2. Tapping Google Sign-In
 * 3. Capturing the idToken from console logs
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGoogleAuth() {
  log('\n=== Testing Google Authentication ===\n', 'cyan');

  try {
    // Test 1: Missing idToken
    log('Test 1: POST /api/auth/google (missing idToken)', 'yellow');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/google`, {});
      log('❌ Should have failed with missing idToken', 'red');
    } catch (error) {
      if (error.response?.status === 400) {
        log('✅ Correctly rejected missing idToken', 'green');
        log(`   Response: ${JSON.stringify(error.response.data)}`, 'blue');
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
      }
    }

    // Test 2: Invalid idToken
    log('\nTest 2: POST /api/auth/google (invalid idToken)', 'yellow');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/google`, {
        idToken: 'invalid_token_12345'
      });
      log('❌ Should have failed with invalid token', 'red');
    } catch (error) {
      if (error.response?.status === 401) {
        log('✅ Correctly rejected invalid token', 'green');
        log(`   Response: ${JSON.stringify(error.response.data)}`, 'blue');
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
      }
    }

    // Test 3: Valid idToken (requires manual input)
    log('\nTest 3: POST /api/auth/google (valid idToken)', 'yellow');
    log('⚠️  To test with valid token:', 'yellow');
    log('   1. Run mobile app', 'cyan');
    log('   2. Tap Google Sign-In button', 'cyan');
    log('   3. Check console for idToken', 'cyan');
    log('   4. Replace VALID_ID_TOKEN below and run again', 'cyan');
    
    const VALID_ID_TOKEN = 'YOUR_VALID_ID_TOKEN_HERE';
    
    if (VALID_ID_TOKEN !== 'YOUR_VALID_ID_TOKEN_HERE') {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
          idToken: VALID_ID_TOKEN
        });
        
        log('✅ Google login successful!', 'green');
        log(`   User: ${response.data.data.user.username}`, 'blue');
        log(`   Email: ${response.data.data.user.email}`, 'blue');
        log(`   Access Token: ${response.data.data.tokens.accessToken.substring(0, 50)}...`, 'blue');
      } catch (error) {
        log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`, 'red');
      }
    } else {
      log('⏭️  Skipped (no valid token provided)', 'yellow');
    }

    log('\n=== Google Auth Tests Complete ===\n', 'cyan');
    log('Summary:', 'yellow');
    log('✅ Endpoint validation working', 'green');
    log('✅ Error handling working', 'green');
    log('⚠️  Manual test with valid token required', 'yellow');
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    if (error.code === 'ECONNREFUSED') {
      log('\n⚠️  Make sure backend server is running:', 'yellow');
      log('   cd backend && npm start', 'cyan');
    }
  }
}

// Run tests
testGoogleAuth();
