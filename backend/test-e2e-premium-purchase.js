/**
 * End-to-End Integration Test: Premium Purchase Flow
 * Tests: Login → Shop → Buy Premium → Payment → Verify Premium Active
 * Requirements: 22.1-22.3
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const VNPAY_SECRET = process.env.VNPAY_SECRET_KEY || 'TESTKEY123456789';

// Test data
const testUser = {
  email: 'testuser@example.com',
  password: 'TestPassword123!'
};

let authTokens = {
  accessToken: null,
  refreshToken: null
};

let premiumData = {
  packages: [],
  selectedPackage: null,
  orderId: null,
  paymentUrl: null
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {}
  };

  if (useAuth && authTokens.accessToken) {
    config.headers['Authorization'] = `Bearer ${authTokens.accessToken}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Helper to simulate VNPay callback
function generateVNPayCallback(orderId, amount, success = true) {
  const params = {
    vnp_Amount: amount * 100, // VNPay uses smallest currency unit
    vnp_BankCode: 'NCB',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: `Premium Package Payment ${orderId}`,
    vnp_PayDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
    vnp_ResponseCode: success ? '00' : '99',
    vnp_TmnCode: 'TESTMERCHANT',
    vnp_TransactionNo: `${Date.now()}`,
    vnp_TransactionStatus: success ? '00' : '99',
    vnp_TxnRef: orderId
  };

  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  // Create query string
  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Calculate secure hash
  const hmac = crypto.createHmac('sha512', VNPAY_SECRET);
  const secureHash = hmac.update(queryString).digest('hex');

  return {
    ...params,
    vnp_SecureHash: secureHash
  };
}

// Test Steps
async function step1_Login() {
  console.log('\n=== Step 1: Login ===');
  
  const result = await apiCall('POST', '/auth/login', testUser);
  
  if (!result.success) {
    console.error('❌ Login failed:', result.error);
    console.log('   Note: Make sure test user exists. Run test-setup.js first.');
    return false;
  }

  console.log('✅ Login successful');
  
  if (result.data.data?.tokens) {
    authTokens.accessToken = result.data.data.tokens.accessToken;
    authTokens.refreshToken = result.data.data.tokens.refreshToken;
    console.log('   Tokens received');
  }
  
  return true;
}

async function step2_ViewShop() {
  console.log('\n=== Step 2: View Premium Shop ===');
  
  const result = await apiCall('GET', '/premium/packages', null, false);
  
  if (!result.success) {
    console.error('❌ Get packages failed:', result.error);
    return false;
  }

  console.log('✅ Premium packages retrieved');
  
  if (result.data.data?.packages) {
    premiumData.packages = result.data.data.packages;
    console.log(`   Available Packages: ${premiumData.packages.length}`);
    
    premiumData.packages.forEach((pkg, index) => {
      console.log(`   ${index + 1}. ${pkg.name} - ${pkg.price} ${pkg.currency}`);
      console.log(`      Duration: ${pkg.durationDays} days`);
      console.log(`      Bonus: +${pkg.scoreBonus * 100}%`);
      console.log(`      Revives: ${pkg.reviveCount}`);
    });
    
    // Select first package for testing
    if (premiumData.packages.length > 0) {
      premiumData.selectedPackage = premiumData.packages[0];
      console.log(`\n   Selected: ${premiumData.selectedPackage.name}`);
    }
  }
  
  return premiumData.packages.length > 0;
}

async function step3_CreatePayment() {
  console.log('\n=== Step 3: Create Payment ===');
  
  if (!premiumData.selectedPackage) {
    console.error('❌ No package selected');
    return false;
  }
  
  const result = await apiCall('POST', '/payment/vnpay/create', {
    packageId: premiumData.selectedPackage.id,
    returnUrl: 'toolchess://payment-return'
  }, true);
  
  if (!result.success) {
    console.error('❌ Create payment failed:', result.error);
    return false;
  }

  console.log('✅ Payment created');
  
  if (result.data.data) {
    premiumData.orderId = result.data.data.orderId;
    premiumData.paymentUrl = result.data.data.paymentUrl;
    console.log('   Order ID:', premiumData.orderId);
    console.log('   Amount:', result.data.data.amount);
    console.log('   Payment URL:', premiumData.paymentUrl ? 'Generated' : 'Missing');
  }
  
  return premiumData.orderId !== null;
}

async function step4_SimulatePayment() {
  console.log('\n=== Step 4: Simulate VNPay Payment ===');
  
  console.log('   Simulating user completing payment on VNPay...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate VNPay callback parameters
  const callbackParams = generateVNPayCallback(
    premiumData.orderId,
    premiumData.selectedPackage.price,
    true // success
  );
  
  console.log('✅ Payment simulation complete');
  console.log('   Response Code:', callbackParams.vnp_ResponseCode);
  console.log('   Transaction No:', callbackParams.vnp_TransactionNo);
  
  // Simulate VNPay callback to backend
  const queryString = Object.entries(callbackParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment/vnpay/return?${queryString}`
    );
    console.log('   Callback processed by backend');
  } catch (error) {
    // Backend might redirect, which causes axios to throw
    // This is expected behavior
    console.log('   Callback sent to backend');
  }
  
  return true;
}

async function step5_CheckPaymentStatus() {
  console.log('\n=== Step 5: Check Payment Status ===');
  
  // Wait a bit for backend to process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const result = await apiCall('GET', `/payment/status/${premiumData.orderId}`, null, true);
  
  if (!result.success) {
    console.error('❌ Get payment status failed:', result.error);
    return false;
  }

  console.log('✅ Payment status retrieved');
  
  if (result.data.data) {
    console.log('   Order ID:', result.data.data.orderId);
    console.log('   Status:', result.data.data.status);
    console.log('   Amount:', result.data.data.amount);
    console.log('   Package:', result.data.data.packageId);
    
    if (result.data.data.status === 'completed') {
      console.log('   ✅ Payment completed successfully');
      return true;
    } else {
      console.log('   ⚠️  Payment not completed yet');
      return false;
    }
  }
  
  return false;
}

async function step6_VerifyPremiumActive() {
  console.log('\n=== Step 6: Verify Premium Active ===');
  
  const result = await apiCall('GET', '/user/me', null, true);
  
  if (!result.success) {
    console.error('❌ Get profile failed:', result.error);
    return false;
  }

  console.log('✅ Profile retrieved');
  
  if (result.data.data?.premium) {
    const premium = result.data.data.premium;
    console.log('   Premium Status:', premium.isActive ? '✅ ACTIVE' : '❌ INACTIVE');
    console.log('   Package:', premium.package || 'N/A');
    console.log('   Score Bonus:', `+${(premium.scoreBonus * 100).toFixed(0)}%`);
    console.log('   Revives Left:', premium.revivesLeft || 0);
    console.log('   Expires:', premium.expiresAt || 'N/A');
    
    return premium.isActive === true;
  }
  
  console.error('   ❌ Premium data not found');
  return false;
}

async function step7_TestPremiumBenefits() {
  console.log('\n=== Step 7: Test Premium Benefits in Game ===');
  
  // Start a game
  const startResult = await apiCall('POST', '/game/start', {
    mode: 'normal'
  }, true);
  
  if (!startResult.success) {
    console.error('❌ Start game failed:', startResult.error);
    return false;
  }
  
  const sessionId = startResult.data.data?.session?.id;
  const premiumApplied = startResult.data.data?.session?.premiumApplied;
  
  console.log('   Game started');
  console.log('   Premium Applied:', premiumApplied ? '✅ Yes' : '❌ No');
  
  // Submit a score
  const baseScore = 1000;
  const submitResult = await apiCall('POST', '/game/submit', {
    sessionId: sessionId,
    score: baseScore,
    turnCount: 20,
    duration: 100
  }, true);
  
  if (!submitResult.success) {
    console.error('❌ Submit score failed:', submitResult.error);
    return false;
  }
  
  const finalScore = submitResult.data.data?.session?.finalScore;
  const scoreIncrease = finalScore - baseScore;
  
  console.log('   Base Score:', baseScore);
  console.log('   Final Score:', finalScore);
  console.log('   Bonus Applied:', scoreIncrease);
  console.log('✅ Premium benefits working');
  
  return premiumApplied && finalScore > baseScore;
}

// Main test execution
async function runE2ETest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  End-to-End Integration Test: Premium Purchase Flow       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base URL: ${API_BASE_URL}`);
  console.log(`Test User: ${testUser.email}`);
  
  const steps = [
    { name: 'Login', fn: step1_Login },
    { name: 'View Shop', fn: step2_ViewShop },
    { name: 'Create Payment', fn: step3_CreatePayment },
    { name: 'Simulate Payment', fn: step4_SimulatePayment },
    { name: 'Check Payment Status', fn: step5_CheckPaymentStatus },
    { name: 'Verify Premium Active', fn: step6_VerifyPremiumActive },
    { name: 'Test Premium Benefits', fn: step7_TestPremiumBenefits }
  ];
  
  let passedSteps = 0;
  let failedSteps = 0;
  
  for (const step of steps) {
    try {
      const success = await step.fn();
      if (success) {
        passedSteps++;
      } else {
        failedSteps++;
        console.log(`\n⚠️  Step "${step.name}" failed. Stopping test.`);
        break;
      }
    } catch (error) {
      failedSteps++;
      console.error(`\n❌ Step "${step.name}" threw error:`, error.message);
      break;
    }
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Total Steps: ${steps.length}`);
  console.log(`Passed: ${passedSteps}`);
  console.log(`Failed: ${failedSteps}`);
  console.log(`Status: ${failedSteps === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(failedSteps === 0 ? 0 : 1);
}

// Run the test
runE2ETest().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
