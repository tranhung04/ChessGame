require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test credentials (create new user or use existing)
const timestamp = Date.now();
const TEST_USER = {
  email: `payment_test_${timestamp}@example.com`,
  password: 'TestPass123!',
  username: `paymenttest_${timestamp}`
};

let authToken = null;
let orderId = null;

/**
 * Test Payment Integration
 */
async function testPaymentIntegration() {
  console.log('=== Testing Payment Integration ===\n');

  try {
    // Step 1: Register or Login
    console.log('1. Registering/Logging in...');
    try {
      // Try to register first
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: TEST_USER.username,
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      authToken = registerResponse.data.data.tokens.accessToken;
      console.log('✓ Registration successful\n');
    } catch (registerError) {
      // If registration fails, try login
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      authToken = loginResponse.data.data.tokens.accessToken;
      console.log('✓ Login successful\n');
    }

    // Step 2: Get premium packages
    console.log('2. Getting premium packages...');
    const packagesResponse = await axios.get(`${API_BASE_URL}/api/premium/packages`);
    const packages = packagesResponse.data.data.packages;
    console.log(`✓ Found ${packages.length} premium packages:`);
    packages.forEach(pkg => {
      console.log(`  - ${pkg.name}: ${pkg.price} ${pkg.currency} (${pkg.durationDays} days, +${pkg.scoreBonus * 100}%)`);
    });
    console.log();

    // Step 3: Create payment for Basic package
    console.log('3. Creating VNPay payment...');
    const packageId = 'basic'; // Use Basic package for testing
    const paymentResponse = await axios.post(
      `${API_BASE_URL}/api/payment/vnpay/create`,
      { packageId },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const paymentData = paymentResponse.data.data;
    orderId = paymentData.orderId;
    
    console.log('✓ Payment created successfully:');
    console.log(`  Order ID: ${paymentData.orderId}`);
    console.log(`  Amount: ${paymentData.amount} ${paymentData.currency}`);
    console.log(`  Package: ${paymentData.packageName}`);
    console.log(`  Expires at: ${paymentData.expiresAt}`);
    console.log(`  Payment URL: ${paymentData.paymentUrl.substring(0, 100)}...`);
    console.log();

    // Step 4: Check payment status
    console.log('4. Checking payment status...');
    const statusResponse = await axios.get(
      `${API_BASE_URL}/api/payment/status/${orderId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✓ Payment status retrieved:');
    console.log(`  Status: ${statusResponse.data.data.status}`);
    console.log(`  Created at: ${statusResponse.data.data.createdAt}`);
    console.log();

    // Step 5: Test VNPay signature generation
    console.log('5. Testing VNPay signature service...');
    const vnpayService = require('./src/services/vnpayService');
    
    const testParams = {
      vnp_Amount: '2900000',
      vnp_Command: 'pay',
      vnp_CreateDate: '20240101120000',
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: 'Test payment',
      vnp_OrderType: 'other',
      vnp_ReturnUrl: 'http://localhost:3000/api/payment/vnpay/return',
      vnp_TmnCode: 'TEST123',
      vnp_TxnRef: 'TEST_ORDER_123',
      vnp_Version: '2.1.0'
    };
    
    const signature = vnpayService.generateSecureHash(testParams);
    console.log('✓ Signature generated successfully');
    console.log(`  Signature: ${signature.substring(0, 50)}...`);
    
    // Test signature verification
    const paramsWithSignature = { ...testParams, vnp_SecureHash: signature };
    const isValid = vnpayService.verifySignature(paramsWithSignature);
    console.log(`✓ Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);
    console.log();

    // Step 6: Get payment history
    console.log('6. Getting payment history...');
    const historyResponse = await axios.get(
      `${API_BASE_URL}/api/payment/history?page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const history = historyResponse.data.data;
    console.log(`✓ Payment history retrieved (${history.payments.length} payments):`);
    history.payments.forEach(payment => {
      console.log(`  - ${payment.orderId}: ${payment.status} - ${payment.amount} ${payment.currency}`);
    });
    console.log();

    console.log('=== All Payment Tests Passed! ===\n');
    console.log('Note: To complete the payment flow:');
    console.log('1. Open the payment URL in a browser');
    console.log('2. Complete the payment on VNPay sandbox');
    console.log('3. VNPay will redirect to the return URL');
    console.log('4. The callback handler will verify signature and activate premium');
    console.log('5. A confirmation email will be sent');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testPaymentIntegration();
