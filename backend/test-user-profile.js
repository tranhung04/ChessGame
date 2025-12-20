/**
 * Test script for User Profile endpoints
 * Tests GET /api/user/me and PUT /api/user/me
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

let accessToken = '';
let testUserId = '';

// Helper function to log test results
function logTest(testName, success, details = '') {
  const status = success ? '✓' : '✗';
  const color = success ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${testName}`);
  if (details) {
    console.log(`  ${details}`);
  }
}

// Test 1: Register a test user
async function testRegister() {
  try {
    const timestamp = Date.now();
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      username: `testuser_${timestamp}`,
      email: `testuser_${timestamp}@example.com`,
      password: 'TestPassword123!'
    });

    if (response.data.success && response.data.data.tokens) {
      accessToken = response.data.data.tokens.accessToken;
      testUserId = response.data.data.user.id;
      logTest('Register test user', true, `User ID: ${testUserId}`);
      return true;
    }
    
    logTest('Register test user', false, 'No tokens returned');
    return false;
  } catch (error) {
    logTest('Register test user', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 2: Get user profile (GET /api/user/me)
async function testGetProfile() {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.data.success && response.data.data) {
      const user = response.data.data;
      
      // Verify response structure
      const hasRequiredFields = 
        user.id && 
        user.username && 
        user.email && 
        user.stats && 
        user.premium;
      
      if (hasRequiredFields) {
        logTest('GET /api/user/me', true, 
          `Username: ${user.username}, Stats: ${user.stats.totalGames} games, Premium: ${user.premium.isActive}`);
        return true;
      }
      
      logTest('GET /api/user/me', false, 'Missing required fields in response');
      return false;
    }
    
    logTest('GET /api/user/me', false, 'Invalid response structure');
    return false;
  } catch (error) {
    logTest('GET /api/user/me', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 3: Get profile without token (should fail)
async function testGetProfileNoAuth() {
  try {
    await axios.get(`${API_BASE_URL}/user/me`);
    logTest('GET /api/user/me without token', false, 'Should have returned 401');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('GET /api/user/me without token', true, 'Correctly returned 401');
      return true;
    }
    logTest('GET /api/user/me without token', false, `Expected 401, got ${error.response?.status}`);
    return false;
  }
}

// Test 4: Update profile with valid data
async function testUpdateProfile() {
  try {
    const timestamp = Date.now();
    const response = await axios.put(`${API_BASE_URL}/user/me`, {
      username: `updated_${timestamp}`,
      email: `updated_${timestamp}@example.com`
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.data.success && response.data.data) {
      const user = response.data.data;
      
      if (user.username.startsWith('updated_') && user.email.startsWith('updated_')) {
        logTest('PUT /api/user/me (valid data)', true, 
          `Updated to: ${user.username}, ${user.email}`);
        return true;
      }
      
      logTest('PUT /api/user/me (valid data)', false, 'Data not updated correctly');
      return false;
    }
    
    logTest('PUT /api/user/me (valid data)', false, 'Invalid response structure');
    return false;
  } catch (error) {
    logTest('PUT /api/user/me (valid data)', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Test 5: Update profile with invalid email
async function testUpdateProfileInvalidEmail() {
  try {
    await axios.put(`${API_BASE_URL}/user/me`, {
      email: 'invalid-email'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    logTest('PUT /api/user/me (invalid email)', false, 'Should have returned validation error');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'INVALID_EMAIL') {
      logTest('PUT /api/user/me (invalid email)', true, 'Correctly rejected invalid email');
      return true;
    }
    logTest('PUT /api/user/me (invalid email)', false, 
      `Expected INVALID_EMAIL error, got ${error.response?.data?.error?.code}`);
    return false;
  }
}

// Test 6: Update profile with empty username
async function testUpdateProfileEmptyUsername() {
  try {
    await axios.put(`${API_BASE_URL}/user/me`, {
      username: ''
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    logTest('PUT /api/user/me (empty username)', false, 'Should have returned validation error');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'VALIDATION_ERROR') {
      logTest('PUT /api/user/me (empty username)', true, 'Correctly rejected empty username');
      return true;
    }
    logTest('PUT /api/user/me (empty username)', false, 
      `Expected VALIDATION_ERROR, got ${error.response?.data?.error?.code}`);
    return false;
  }
}

// Test 7: Update profile with no fields
async function testUpdateProfileNoFields() {
  try {
    await axios.put(`${API_BASE_URL}/user/me`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    logTest('PUT /api/user/me (no fields)', false, 'Should have returned validation error');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'VALIDATION_ERROR') {
      logTest('PUT /api/user/me (no fields)', true, 'Correctly rejected empty update');
      return true;
    }
    logTest('PUT /api/user/me (no fields)', false, 
      `Expected VALIDATION_ERROR, got ${error.response?.data?.error?.code}`);
    return false;
  }
}

// Test 8: Verify profile was updated
async function testVerifyUpdate() {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.data.success && response.data.data) {
      const user = response.data.data;
      
      if (user.username.startsWith('updated_') && user.email.startsWith('updated_')) {
        logTest('Verify profile update persisted', true, 
          `Profile still shows: ${user.username}`);
        return true;
      }
      
      logTest('Verify profile update persisted', false, 'Update did not persist');
      return false;
    }
    
    logTest('Verify profile update persisted', false, 'Could not retrieve profile');
    return false;
  } catch (error) {
    logTest('Verify profile update persisted', false, error.response?.data?.error?.message || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n=== User Profile Endpoint Tests ===\n');
  
  const results = [];
  
  // Setup
  results.push(await testRegister());
  
  if (!results[0]) {
    console.log('\n❌ Setup failed. Cannot continue tests.\n');
    return;
  }
  
  // Run tests
  results.push(await testGetProfile());
  results.push(await testGetProfileNoAuth());
  results.push(await testUpdateProfile());
  results.push(await testUpdateProfileInvalidEmail());
  results.push(await testUpdateProfileEmptyUsername());
  results.push(await testUpdateProfileNoFields());
  results.push(await testVerifyUpdate());
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✓ All tests passed!\n');
  } else {
    console.log(`\n✗ ${total - passed} test(s) failed\n`);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return true;
  } catch (error) {
    console.error('\n❌ Server is not running. Please start the server first:');
    console.error('   cd backend && npm start\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
})();
