require('dotenv').config();

/**
 * Simple Payment Service Tests (No Authentication Required)
 */
async function testPaymentServices() {
  console.log('=== Testing Payment Services ===\n');

  try {
    // Test 1: VNPay Service - Signature Generation
    console.log('1. Testing VNPay signature generation...');
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
    console.log(`  Signature length: ${signature.length} characters`);
    console.log(`  Signature (first 50 chars): ${signature.substring(0, 50)}...`);
    console.log();

    // Test 2: VNPay Service - Signature Verification
    console.log('2. Testing VNPay signature verification...');
    const paramsWithSignature = { ...testParams, vnp_SecureHash: signature };
    const isValid = vnpayService.verifySignature(paramsWithSignature);
    console.log(`✓ Signature verification: ${isValid ? 'VALID ✓' : 'INVALID ✗'}`);
    
    if (!isValid) {
      throw new Error('Signature verification failed!');
    }
    console.log();

    // Test 3: VNPay Service - Invalid Signature Detection
    console.log('3. Testing invalid signature detection...');
    const invalidParams = { ...testParams, vnp_SecureHash: 'invalid_signature_12345' };
    const isInvalid = vnpayService.verifySignature(invalidParams);
    console.log(`✓ Invalid signature detected: ${!isInvalid ? 'CORRECT ✓' : 'FAILED ✗'}`);
    
    if (isInvalid) {
      throw new Error('Invalid signature was not detected!');
    }
    console.log();

    // Test 4: VNPay Service - Response Code Parsing
    console.log('4. Testing VNPay response code parsing...');
    const testCases = [
      { code: '00', expectedStatus: 'completed', expectedMsg: 'Giao dịch thành công' },
      { code: '07', expectedStatus: 'pending', expectedMsg: 'Trừ tiền thành công. Giao dịch đang chờ xác nhận' },
      { code: '24', expectedStatus: 'failed', expectedMsg: 'Giao dịch không thành công do: Khách hàng hủy giao dịch' },
      { code: '99', expectedStatus: 'failed', expectedMsg: 'Lỗi không xác định' }
    ];
    
    let allPassed = true;
    testCases.forEach(test => {
      const status = vnpayService.parseResponseCode(test.code);
      const message = vnpayService.getResponseMessage(test.code);
      const passed = status === test.expectedStatus && message === test.expectedMsg;
      
      if (!passed) {
        console.log(`  ✗ Code ${test.code}: Expected ${test.expectedStatus}, got ${status}`);
        allPassed = false;
      } else {
        console.log(`  ✓ Code ${test.code}: ${status} - "${message}"`);
      }
    });
    
    if (!allPassed) {
      throw new Error('Some response code tests failed!');
    }
    console.log();

    // Test 5: VNPay Service - Payment URL Generation
    console.log('5. Testing VNPay payment URL generation...');
    const paymentUrl = vnpayService.generatePaymentUrl({
      orderId: 'TEST_ORDER_' + Date.now(),
      amount: 29000,
      orderInfo: 'Test payment for Basic package',
      ipAddr: '127.0.0.1'
    });
    
    console.log('✓ Payment URL generated successfully');
    console.log(`  URL length: ${paymentUrl.length} characters`);
    console.log(`  Base URL: ${paymentUrl.split('?')[0]}`);
    console.log(`  Parameters count: ${paymentUrl.split('&').length}`);
    
    // Verify URL contains required parameters
    const requiredParams = ['vnp_Amount', 'vnp_TxnRef', 'vnp_SecureHash', 'vnp_ReturnUrl'];
    const missingParams = requiredParams.filter(param => !paymentUrl.includes(param));
    
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }
    console.log('✓ All required parameters present in URL');
    console.log();

    // Test 6: Date Formatting
    console.log('6. Testing date formatting...');
    const testDate = new Date('2024-01-15T10:30:45Z');
    const formatted = vnpayService.formatDate(testDate);
    console.log(`✓ Date formatted: ${formatted}`);
    console.log(`  Expected format: yyyyMMddHHmmss`);
    console.log(`  Length: ${formatted.length} (should be 14)`);
    
    if (formatted.length !== 14) {
      throw new Error('Date format incorrect!');
    }
    console.log();

    console.log('=== All Payment Service Tests Passed! ===\n');
    console.log('Summary:');
    console.log('✓ VNPay signature generation works correctly');
    console.log('✓ VNPay signature verification works correctly');
    console.log('✓ Invalid signatures are properly detected');
    console.log('✓ Response codes are parsed correctly');
    console.log('✓ Payment URLs are generated with all required parameters');
    console.log('✓ Date formatting follows VNPay requirements');
    console.log();
    console.log('Next steps:');
    console.log('1. Ensure test users are seeded in database');
    console.log('2. Run test-payment.js for full integration tests');
    console.log('3. Test actual payment flow with VNPay sandbox');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
testPaymentServices();
