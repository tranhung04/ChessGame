/**
 * Test Leaderboard Caching
 * This script tests the leaderboard caching functionality
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

let authToken = null;

/**
 * Login to get auth token
 */
async function login() {
  try {
    console.log('\n=== Logging in ===');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'testuser1@test.toolchess.com',
      password: 'TestPass123!'
    });
    
    if (response.data.success) {
      authToken = response.data.data.tokens.accessToken;
      console.log('✓ Login successful');
      return true;
    }
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test leaderboard caching
 */
async function testLeaderboardCache() {
  try {
    console.log('\n=== Testing Leaderboard Cache ===');
    
    // First request - should hit database
    console.log('\n1. First request (should hit database):');
    const start1 = Date.now();
    const response1 = await axios.get(
      `${API_BASE_URL}/api/game/leaderboard?limit=10&period=all`
    );
    const time1 = Date.now() - start1;
    console.log(`   Response time: ${time1}ms`);
    console.log(`   Players returned: ${response1.data.data.leaderboard.length}`);
    
    // Second request - should hit cache (faster)
    console.log('\n2. Second request (should hit cache):');
    const start2 = Date.now();
    const response2 = await axios.get(
      `${API_BASE_URL}/api/game/leaderboard?limit=10&period=all`
    );
    const time2 = Date.now() - start2;
    console.log(`   Response time: ${time2}ms`);
    console.log(`   Players returned: ${response2.data.data.leaderboard.length}`);
    
    // Third request with different parameters - should hit database
    console.log('\n3. Third request with different limit (should hit database):');
    const start3 = Date.now();
    const response3 = await axios.get(
      `${API_BASE_URL}/api/game/leaderboard?limit=20&period=all`
    );
    const time3 = Date.now() - start3;
    console.log(`   Response time: ${time3}ms`);
    console.log(`   Players returned: ${response3.data.data.leaderboard.length}`);
    
    // Fourth request with different period - should hit database
    console.log('\n4. Fourth request with different period (should hit database):');
    const start4 = Date.now();
    const response4 = await axios.get(
      `${API_BASE_URL}/api/game/leaderboard?limit=10&period=weekly`
    );
    const time4 = Date.now() - start4;
    console.log(`   Response time: ${time4}ms`);
    console.log(`   Players returned: ${response4.data.data.leaderboard.length}`);
    
    // Fifth request - same as first, should hit cache
    console.log('\n5. Fifth request (same as first, should hit cache):');
    const start5 = Date.now();
    const response5 = await axios.get(
      `${API_BASE_URL}/api/game/leaderboard?limit=10&period=all`
    );
    const time5 = Date.now() - start5;
    console.log(`   Response time: ${time5}ms`);
    console.log(`   Players returned: ${response5.data.data.leaderboard.length}`);
    
    console.log('\n=== Cache Performance Analysis ===');
    console.log(`First request (DB):    ${time1}ms`);
    console.log(`Second request (Cache): ${time2}ms`);
    console.log(`Cache speedup: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
    
    if (time2 < time1) {
      console.log('✓ Cache is working - second request was faster');
    } else {
      console.log('⚠ Cache may not be working - second request was not faster');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Leaderboard cache test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('===========================================');
  console.log('  Leaderboard Cache Test Suite');
  console.log('===========================================');
  console.log('API Base URL:', API_BASE_URL);
  
  // Test cache (no auth needed for leaderboard)
  await testLeaderboardCache();
  
  console.log('\n===========================================');
  console.log('  Test Complete');
  console.log('===========================================\n');
}

// Run tests
runTests().catch(console.error);
