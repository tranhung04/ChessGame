/**
 * Simple test script for authentication endpoints
 * Run with: node test-auth.js
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test data
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `testuser_${Date.now()}@example.com`,
  password: 'TestPass123!'
};

let accessToken = '';
let refreshToken = '';

async function testRegister() {
  console.log('\n=== Testing Registration ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    console.log('✓ Registration successful');
    console.log('User:', response.data.data.user.Username);
    console.log('Email:', response.data.data.user.Email);
    
    accessToken = response.data.data.tokens.accessToken;
    refreshToken = response.data.data.tokens.refreshToken;
    
    console.log('✓ Tokens received');
    return true;
  } catch (error) {
    console.error('✗ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n=== Testing Login ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✓ Login successful');
    console.log('User:', response.data.data.user.Username);
    
    accessToken = response.data.data.tokens.accessToken;
    refreshToken = response.data.data.tokens.refreshToken;
    
    console.log('✓ New tokens received');
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testProtectedEndpoint() {
  console.log('\n=== Testing Protected Endpoint (Health Check with Auth) ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✓ Protected endpoint accessible with valid token');
    return true;
  } catch (error) {
    console.error('✗ Protected endpoint failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRefreshToken() {
  console.log('\n=== Testing Token Refresh ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
      refreshToken: refreshToken
    });
    console.log('✓ Token refresh successful');
    
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;
    
    console.log('✓ New tokens received');
    return true;
  } catch (error) {
    console.error('✗ Token refresh failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n=== Testing Logout ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {
      refreshToken: refreshToken
    });
    console.log('✓ Logout successful');
    return true;
  } catch (error) {
    console.error('✗ Logout failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidCredentials() {
  console.log('\n=== Testing Invalid Credentials ===');
  try {
    await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: 'WrongPassword123!'
    });
    console.error('✗ Should have failed with invalid credentials');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Invalid credentials correctly rejected');
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function testWeakPassword() {
  console.log('\n=== Testing Weak Password ===');
  try {
    await axios.post(`${API_BASE_URL}/api/auth/register`, {
      username: 'weakpassuser',
      email: 'weakpass@example.com',
      password: 'weak'
    });
    console.error('✗ Should have failed with weak password');
    return false;
  } catch (error) {
    if (error.response?.data?.error?.code === 'WEAK_PASSWORD') {
      console.log('✓ Weak password correctly rejected');
      console.log('  Errors:', error.response.data.error.details.errors);
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('===========================================');
  console.log('  Authentication System Test Suite');
  console.log('===========================================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  
  const results = [];
  
  // Run tests
  results.push(await testRegister());
  results.push(await testLogin());
  results.push(await testProtectedEndpoint());
  results.push(await testRefreshToken());
  results.push(await testInvalidCredentials());
  results.push(await testWeakPassword());
  results.push(await testLogout());
  
  // Summary
  console.log('\n===========================================');
  console.log('  Test Summary');
  console.log('===========================================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✓ All tests passed!');
  } else {
    console.log(`✗ ${total - passed} test(s) failed`);
  }
}

// Check if server is running
axios.get(`${API_BASE_URL}/health`)
  .then(() => {
    console.log('✓ Server is running');
    runTests();
  })
  .catch((error) => {
    console.error('✗ Server is not running or not accessible');
    console.error('  Please start the server with: npm run dev');
    console.error('  Error:', error.message);
    process.exit(1);
  });
