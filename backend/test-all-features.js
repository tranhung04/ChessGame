/**
 * Comprehensive Feature Test Suite
 * Tests all major features of the ToolChess backend
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, error = null) {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  console.log(`${status}: ${name}`);
  if (error) {
    console.log(`  Error: ${error}`);
  }
  
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

// Test data
let testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPass123!'
};

let authTokens = {
  accessToken: null,
  refreshToken: null
};

let gameSession = {
  sessionId: null
};

let paymentOrder = {
  orderId: null
};

// ============================================
// 1. AUTHENTICATION TESTS
// ============================================

async function testAuthentication() {
  console.log('\n=== AUTHENTICATION TESTS ===\n');
  
  // Test 1.1: Register with valid data
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    const success = response.status === 201 && response.data.success;
    logTest('Register with valid data', success);
    
    if (success) {
      authTokens.accessToken = response.data.data.tokens.accessToken;
      authTokens.refreshToken = response.data.data.tokens.refreshToken;
    }
  } catch (error) {
    logTest('Register with valid data', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 1.2: Register with duplicate email
  try {
    await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    logTest('Register with duplicate email (should fail)', false, 'Did not reject duplicate email');
  } catch (error) {
    const isDuplicateError = error.response?.status === 400;
    logTest('Register with duplicate email (should fail)', isDuplicateError);
  }
  
  // Test 1.3: Login with valid credentials
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const success = response.status === 200 && response.data.success;
    logTest('Login with valid credentials', success);
    
    if (success) {
      authTokens.accessToken = response.data.data.tokens.accessToken;
      authTokens.refreshToken = response.data.data.tokens.refreshToken;
    }
  } catch (error) {
    logTest('Login with valid credentials', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 1.4: Login with invalid credentials
  try {
    await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: 'WrongPassword123!'
    });
    logTest('Login with invalid credentials (should fail)', false, 'Did not reject invalid credentials');
  } catch (error) {
    const isAuthError = error.response?.status === 401;
    logTest('Login with invalid credentials (should fail)', isAuthError);
  }
  
  // Test 1.5: Access protected endpoint with valid token
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${authTokens.accessToken}` }
    });
    const success = response.status === 200 && response.data.success;
    logTest('Access protected endpoint with valid token', success);
  } catch (error) {
    logTest('Access protected endpoint with valid token', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 1.6: Refresh token
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
      refreshToken: authTokens.refreshToken
    });
    const success = response.status === 200 && response.data.success;
    logTest('Refresh token', success);
    
    if (success) {
      authTokens.accessToken = response.data.data.accessToken;
      authTokens.refreshToken = response.data.data.refreshToken;
    }
  } catch (error) {
    logTest('Refresh token', false, error.response?.data?.error?.message || error.message);
  }
}

// ============================================
// 2. USER PROFILE TESTS
// ============================================

async function testUserProfile() {
  console.log('\n=== USER PROFILE TESTS ===\n');
  
  // Test 2.1: Get user profile
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${authTokens.accessToken}` }
    });
    const success = response.status === 200 && response.data.success && response.data.data.email === testUser.email;
    logTest('Get user profile', success);
  } catch (error) {
    logTest('Get user profile', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 2.2: Update user profile
  try {
    const newUsername = `updated_${Date.now()}`;
    const response = await axios.put(`${API_BASE_URL}/api/user/me`, {
      username: newUsername
    }, {
      headers: { Authorization: `Bearer ${authTokens.accessToken}` }
    });
    const success = response.status === 200 && response.data.success;
    logTest('Update user profile', success);
  } catch (error) {
    logTest('Update user profile', false, error.response?.data?.error?.message || error.message);
  }
}

// ============================================
// 3. PREMIUM PACKAGE TESTS
// ============================================

async function testPremiumPackages() {
  console.log('\n=== PREMIUM PACKAGE TESTS ===\n');
  
  // Test 3.1: Get all premium packages
  try {
    const response = await axios.get(`${API_BASE_URL}/api/premium/packages`);
    const success = response.status === 200 && response.data.success && Array.isArray(response.data.data.packages);
    logTest('Get all premium packages', success);
  } catch (error) {
    logTest('Get all premium packages', false, error.response?.data?.error?.message || error.message);
  }
}

// ============================================
// 4. PAYMENT TESTS
// ============================================

async function testPayment() {
  console.log('\n=== PAYMENT TESTS ===\n');
  
  // Test 4.1: Create VNPay payment
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/vnpay/create`, {
      packageId: 'basic',
      returnUrl: 'toolchess://payment-return'
    }, {
      headers: { Authorization: `Bearer ${authTokens.accessToken}` }
    });
    const success = response.status === 200 && response.data.success && response.data.data.paymentUrl;
    logTest('Create VNPay payment', success);
    
    if (success) {
      paymentOrder.orderId = response.data.data.orderId;
    }
  } catch (error) {
    logTest('Create VNPay payment', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 4.2: Get payment status
  if (paymentOrder.orderId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/status/${paymentOrder.orderId}`, {
        headers: { Authorization: `Bearer ${authTokens.accessToken}` }
      });
      const success = response.status === 200 && response.data.success;
      logTest('Get payment status', success);
    } catch (error) {
      logTest('Get payment status', false, error.response?.data?.error?.message || error.message);
    }
  }
}

// ============================================
// 5. GAME SESSION TESTS
// ============================================

async function testGameSession() {
  console.log('\n=== GAME SESSION TESTS ===\n');
  
  // Test 5.1: Start game session
  try {
    const response = await axios.post(`${API_BASE_URL}/api/game/start`, {
      mode: 'normal'
    }, {
      headers: { Authorization: `Bearer ${authTokens.accessToken}` }
    });
    const success = response.status === 200 && response.data.success && response.data.data.session.id;
    logTest('Start game session', success);
    
    if (success) {
      gameSession.sessionId = response.data.data.session.id;
    }
  } catch (error) {
    logTest('Start game session', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 5.2: Submit game score
  if (gameSession.sessionId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/game/submit`, {
        sessionId: gameSession.sessionId,
        score: 1500,
        turnCount: 25,
        duration: 300
      }, {
        headers: { Authorization: `Bearer ${authTokens.accessToken}` }
      });
      const success = response.status === 200 && response.data.success;
      logTest('Submit game score', success);
    } catch (error) {
      logTest('Submit game score', false, error.response?.data?.error?.message || error.message);
    }
  }
  
  // Test 5.3: Submit invalid score (too high)
  try {
    const response = await axios.post(`${API_BASE_URL}/api/game/start`, {
      mode: 'normal'
    }, {
      headers: { Authorization: `Bearer ${authTokens.accessToken}` }
    });
    
    if (response.data.success) {
      const invalidSessionId = response.data.data.session.id;
      
      try {
        await axios.post(`${API_BASE_URL}/api/game/submit`, {
          sessionId: invalidSessionId,
          score: 999999, // Impossibly high score
          turnCount: 1,
          duration: 1
        }, {
          headers: { Authorization: `Bearer ${authTokens.accessToken}` }
        });
        logTest('Submit invalid score (should fail)', false, 'Did not reject invalid score');
      } catch (error) {
        const isValidationError = error.response?.status === 400;
        logTest('Submit invalid score (should fail)', isValidationError);
      }
    }
  } catch (error) {
    logTest('Submit invalid score (should fail)', false, 'Could not create test session');
  }
  
  // Test 5.4: Get game history
  try {
    const response = await axios.get(`${API_BASE_URL}/api/game/history?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authTokens.accessToken}` }
    });
    const success = response.status === 200 && response.data.success && Array.isArray(response.data.data.sessions);
    logTest('Get game history', success);
  } catch (error) {
    logTest('Get game history', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 5.5: Get leaderboard
  try {
    const response = await axios.get(`${API_BASE_URL}/api/game/leaderboard?limit=10`);
    const success = response.status === 200 && response.data.success && Array.isArray(response.data.data.leaderboard);
    logTest('Get leaderboard', success);
  } catch (error) {
    logTest('Get leaderboard', false, error.response?.data?.error?.message || error.message);
  }
}

// ============================================
// 6. SECURITY TESTS
// ============================================

async function testSecurity() {
  console.log('\n=== SECURITY TESTS ===\n');
  
  // Test 6.1: Access protected endpoint without token
  try {
    await axios.get(`${API_BASE_URL}/api/user/me`);
    logTest('Access protected endpoint without token (should fail)', false, 'Did not reject missing token');
  } catch (error) {
    const isAuthError = error.response?.status === 401;
    logTest('Access protected endpoint without token (should fail)', isAuthError);
  }
  
  // Test 6.2: Access protected endpoint with invalid token
  try {
    await axios.get(`${API_BASE_URL}/api/user/me`, {
      headers: { Authorization: 'Bearer invalid_token_12345' }
    });
    logTest('Access protected endpoint with invalid token (should fail)', false, 'Did not reject invalid token');
  } catch (error) {
    const isAuthError = error.response?.status === 401;
    logTest('Access protected endpoint with invalid token (should fail)', isAuthError);
  }
  
  // Test 6.3: SQL injection attempt
  try {
    await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: "admin' OR '1'='1",
      password: "password"
    });
    logTest('SQL injection attempt (should fail)', false, 'Did not reject SQL injection');
  } catch (error) {
    const isRejected = error.response?.status === 400 || error.response?.status === 401;
    logTest('SQL injection attempt (should fail)', isRejected);
  }
}

// ============================================
// 7. LOGOUT TEST
// ============================================

async function testLogout() {
  console.log('\n=== LOGOUT TEST ===\n');
  
  // Test 7.1: Logout
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {
      refreshToken: authTokens.refreshToken
    });
    const success = response.status === 200 && response.data.success;
    logTest('Logout', success);
  } catch (error) {
    logTest('Logout', false, error.response?.data?.error?.message || error.message);
  }
  
  // Test 7.2: Try to use revoked refresh token
  try {
    await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
      refreshToken: authTokens.refreshToken
    });
    logTest('Use revoked refresh token (should fail)', false, 'Did not reject revoked token');
  } catch (error) {
    const isAuthError = error.response?.status === 401;
    logTest('Use revoked refresh token (should fail)', isAuthError);
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     ToolChess Backend - Comprehensive Feature Tests       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base URL: ${API_BASE_URL}\n`);
  
  try {
    await testAuthentication();
    await testUserProfile();
    await testPremiumPackages();
    await testPayment();
    await testGameSession();
    await testSecurity();
    await testLogout();
    
    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      TEST SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`✓ Passed: ${results.passed}`);
    console.log(`✗ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%\n`);
    
    if (results.failed > 0) {
      console.log('Failed Tests:');
      results.tests.filter(t => !t.passed).forEach(t => {
        console.log(`  - ${t.name}`);
        if (t.error) {
          console.log(`    Error: ${t.error}`);
        }
      });
      console.log('');
    }
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n✗ Test suite failed with error:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
