/**
 * Test script for Premium Package System
 * Tests premium packages, subscriptions, and endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const timestamp = Date.now();
const testUser = {
  email: `premium_test_${timestamp}@example.com`,
  password: 'TestPass123!',
  username: `testuser_${timestamp}`
};

let accessToken = null;
let userId = null;

/**
 * Helper function to make authenticated requests
 */
async function authenticatedRequest(method, url, data = null) {
  const config = {
    method,
    url: `${API_BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  if (data) {
    config.data = data;
  }

  return axios(config);
}

/**
 * Test 1: Register or Login to get access token
 */
async function testLogin() {
  console.log('\n=== Test 1: Login/Register ===');
  
  // Try to login first
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    
    if (response.data.success) {
      accessToken = response.data.data.tokens.accessToken;
      userId = response.data.data.user.id;
      console.log('✓ Login successful');
      console.log(`  User ID: ${userId}`);
      return true;
    }
  } catch (loginError) {
    console.log('  Login failed, attempting registration...');
    
    // Try to register
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password
      });
      
      if (registerResponse.data.success) {
        accessToken = registerResponse.data.data.tokens.accessToken;
        userId = registerResponse.data.data.user.id;
        console.log('✓ Registration successful');
        console.log(`  User ID: ${userId}`);
        return true;
      }
    } catch (registerError) {
      console.log('✗ Registration error:', registerError.response?.data || registerError.message);
      return false;
    }
  }
  
  return false;
}

/**
 * Test 2: Get all premium packages
 */
async function testGetPackages() {
  console.log('\n=== Test 2: Get Premium Packages ===');
  try {
    const response = await axios.get(`${API_BASE_URL}/premium/packages`);
    
    if (response.data.success) {
      const packages = response.data.data.packages;
      console.log('✓ Retrieved premium packages');
      console.log(`  Total packages: ${packages.length}`);
      
      packages.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.price} ${pkg.currency} (${pkg.durationDays} days, +${pkg.scoreBonus * 100}% bonus, ${pkg.reviveCount} revives)`);
      });
      
      return packages;
    } else {
      console.log('✗ Failed to get packages');
      return null;
    }
  } catch (error) {
    console.log('✗ Error getting packages:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test 3: Get premium status (should be inactive initially)
 */
async function testGetStatusInactive() {
  console.log('\n=== Test 3: Get Premium Status (Should be Inactive) ===');
  try {
    const response = await authenticatedRequest('get', '/premium/status');
    
    if (response.data.success) {
      const premium = response.data.data.premium;
      console.log('✓ Retrieved premium status');
      console.log(`  Is Active: ${premium.isActive}`);
      console.log(`  Score Bonus: ${premium.scoreBonus}`);
      console.log(`  Revives Left: ${premium.revivesLeft}`);
      
      if (!premium.isActive) {
        console.log('✓ Premium is correctly inactive');
      } else {
        console.log('⚠ Premium is active (unexpected)');
      }
      
      return true;
    } else {
      console.log('✗ Failed to get premium status');
      return false;
    }
  } catch (error) {
    console.log('✗ Error getting premium status:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 4: Subscribe to a premium package
 */
async function testSubscribe(packageId) {
  console.log('\n=== Test 4: Subscribe to Premium Package ===');
  try {
    const response = await authenticatedRequest('post', '/premium/subscribe', {
      packageId: packageId,
      paymentId: 'test_payment_' + Date.now() // Mock payment ID
    });
    
    if (response.data.success) {
      const subscription = response.data.data.subscription;
      console.log('✓ Subscription created successfully');
      console.log(`  Package: ${subscription.packageName}`);
      console.log(`  Start Date: ${subscription.startDate}`);
      console.log(`  End Date: ${subscription.endDate}`);
      console.log(`  Score Bonus: +${subscription.scoreBonus * 100}%`);
      console.log(`  Revive Count: ${subscription.reviveCount}`);
      
      return true;
    } else {
      console.log('✗ Failed to subscribe');
      return false;
    }
  } catch (error) {
    console.log('✗ Error subscribing:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 5: Get premium status (should be active now)
 */
async function testGetStatusActive() {
  console.log('\n=== Test 5: Get Premium Status (Should be Active) ===');
  try {
    const response = await authenticatedRequest('get', '/premium/status');
    
    if (response.data.success) {
      const premium = response.data.data.premium;
      console.log('✓ Retrieved premium status');
      console.log(`  Is Active: ${premium.isActive}`);
      console.log(`  Package: ${premium.package}`);
      console.log(`  Score Bonus: +${premium.scoreBonus * 100}%`);
      console.log(`  Revives Left: ${premium.revivesLeft}`);
      console.log(`  Expires At: ${premium.expiresAt}`);
      
      if (premium.isActive) {
        console.log('✓ Premium is correctly active');
      } else {
        console.log('✗ Premium is not active (unexpected)');
      }
      
      return premium;
    } else {
      console.log('✗ Failed to get premium status');
      return null;
    }
  } catch (error) {
    console.log('✗ Error getting premium status:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test 6: Use a revive
 */
async function testUseRevive() {
  console.log('\n=== Test 6: Use a Revive ===');
  try {
    const response = await authenticatedRequest('post', '/premium/use-revive');
    
    if (response.data.success) {
      const premium = response.data.data.premium;
      console.log('✓ Revive used successfully');
      console.log(`  Revives Left: ${premium.revivesLeft}`);
      console.log(`  Revives Used: ${premium.revivesUsed}`);
      
      return true;
    } else {
      console.log('✗ Failed to use revive');
      return false;
    }
  } catch (error) {
    console.log('✗ Error using revive:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 7: Test premium bonus calculation
 */
function testPremiumBonusCalculation() {
  console.log('\n=== Test 7: Premium Bonus Calculation ===');
  
  const premiumService = require('./src/services/premiumService');
  
  const testCases = [
    { baseScore: 100, bonus: 0.1, expected: 110 },
    { baseScore: 100, bonus: 0.2, expected: 120 },
    { baseScore: 100, bonus: 0.3, expected: 130 },
    { baseScore: 100, bonus: 0.5, expected: 150 },
    { baseScore: 250, bonus: 0.3, expected: 325 },
    { baseScore: 1000, bonus: 0.5, expected: 1500 },
    { baseScore: 123, bonus: 0.25, expected: 153 }, // 123 * 1.25 = 153.75 -> 153
  ];
  
  let allPassed = true;
  
  testCases.forEach(({ baseScore, bonus, expected }) => {
    const result = premiumService.calculatePremiumBonus(baseScore, bonus);
    const passed = result === expected;
    
    if (passed) {
      console.log(`✓ ${baseScore} * (1 + ${bonus}) = ${result} (expected ${expected})`);
    } else {
      console.log(`✗ ${baseScore} * (1 + ${bonus}) = ${result} (expected ${expected})`);
      allPassed = false;
    }
  });
  
  if (allPassed) {
    console.log('✓ All bonus calculations passed');
  } else {
    console.log('✗ Some bonus calculations failed');
  }
  
  return allPassed;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('===========================================');
  console.log('  Premium Package System Test Suite');
  console.log('===========================================');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without login. Please ensure:');
    console.log('  1. Backend server is running (npm start)');
    console.log('  2. Database is set up with test user');
    console.log('  3. Test user credentials are correct');
    return;
  }
  
  // Test 2: Get packages
  const packages = await testGetPackages();
  if (!packages || packages.length === 0) {
    console.log('\n❌ No premium packages found. Please run seed script.');
    return;
  }
  
  // Test 3: Get status (inactive)
  await testGetStatusInactive();
  
  // Test 4: Subscribe to first package
  const firstPackage = packages[0];
  const subscribeSuccess = await testSubscribe(firstPackage.id);
  
  if (subscribeSuccess) {
    // Test 5: Get status (active)
    const premiumStatus = await testGetStatusActive();
    
    // Test 6: Use a revive
    if (premiumStatus && premiumStatus.revivesLeft > 0) {
      await testUseRevive();
    }
  }
  
  // Test 7: Bonus calculation
  testPremiumBonusCalculation();
  
  console.log('\n===========================================');
  console.log('  Test Suite Complete');
  console.log('===========================================\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
