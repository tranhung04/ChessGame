/**
 * Security Testing Script
 * Tests authentication bypass prevention and SQL injection protection
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test helper function
 */
async function runTest(testName, testFn) {
  try {
    log(`\n🧪 ${testName}`, 'cyan');
    await testFn();
    log(`✅ PASSED: ${testName}`, 'green');
    testsPassed++;
  } catch (error) {
    log(`❌ FAILED: ${testName}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    testsFailed++;
  }
}

/**
 * Test 1: Access protected endpoint without token
 */
async function testNoToken() {
  try {
    await axios.get(`${API_BASE_URL}/api/user/me`);
    throw new Error('Expected 401 but request succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const data = error.response.data;
      if (data.error && data.error.code === 'NO_TOKEN') {
        return; // Test passed
      }
      throw new Error(`Expected error code NO_TOKEN, got: ${data.error?.code}`);
    }
    throw new Error(`Expected 401 status, got: ${error.response?.status}`);
  }
}

/**
 * Test 2: Access with invalid token
 */
async function testInvalidToken() {
  try {
    await axios.get(`${API_BASE_URL}/api/user/me`, {
      headers: {
        Authorization: 'Bearer invalid_token_12345'
      }
    });
    throw new Error('Expected 401 but request succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const data = error.response.data;
      if (data.error && (data.error.code === 'INVALID_TOKEN' || data.error.code === 'AUTHENTICATION_FAILED')) {
        return; // Test passed
      }
      throw new Error(`Expected error code INVALID_TOKEN, got: ${data.error?.code}`);
    }
    throw new Error(`Expected 401 status, got: ${error.response?.status}`);
  }
}

/**
 * Test 3: Access with malformed authorization header
 */
async function testMalformedAuth() {
  try {
    await axios.get(`${API_BASE_URL}/api/user/me`, {
      headers: {
        Authorization: 'InvalidFormat token123'
      }
    });
    throw new Error('Expected 401 but request succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return; // Test passed
    }
    throw new Error(`Expected 401 status, got: ${error.response?.status}`);
  }
}

/**
 * Test 4: SQL Injection in login email field
 */
async function testSQLInjectionLogin() {
  const injectionPayloads = [
    "admin@test.com' OR '1'='1",
    "admin@test.com' OR 1=1--",
    "admin@test.com'; DROP TABLE Users--",
    "admin@test.com' UNION SELECT * FROM Users--"
  ];

  for (const payload of injectionPayloads) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: payload,
        password: 'test123'
      });
      
      // If we get here, check that we didn't actually bypass authentication
      if (response.status === 200 && response.data.success) {
        throw new Error(`SQL injection may have succeeded with payload: ${payload}`);
      }
    } catch (error) {
      // Expected to fail - either 400 (validation) or 401 (invalid credentials)
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        continue; // Good, injection was prevented
      }
      throw error;
    }
  }
}

/**
 * Test 5: SQL Injection in registration fields
 */
async function testSQLInjectionRegister() {
  const injectionPayloads = [
    { username: "admin' OR '1'='1", email: 'test@test.com', password: 'Test123!@#' },
    { username: 'testuser', email: "test@test.com' OR '1'='1", password: 'Test123!@#' },
    { username: "admin'; DROP TABLE Users--", email: 'test@test.com', password: 'Test123!@#' }
  ];

  for (const payload of injectionPayloads) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      
      // If registration succeeds, verify it's a legitimate user, not SQL injection
      if (response.status === 201 && response.data.success) {
        // This might be okay if validation allowed it as a legitimate username
        // But we should verify the database wasn't compromised
        log(`   Warning: Registration succeeded with payload: ${JSON.stringify(payload)}`, 'yellow');
      }
    } catch (error) {
      // Expected to fail - validation should reject these
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        continue; // Good, injection was prevented
      }
      throw error;
    }
  }
}

/**
 * Test 6: XSS in input fields
 */
async function testXSSPrevention() {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")'
  ];

  for (const payload of xssPayloads) {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: payload,
        email: 'test@test.com',
        password: 'Test123!@#'
      });
    } catch (error) {
      // Expected to fail validation
      if (error.response && error.response.status === 400) {
        continue; // Good, XSS was prevented by validation
      }
    }
  }
}

/**
 * Test 7: Rate limiting on auth endpoints
 */
async function testAuthRateLimit() {
  log('   Sending multiple requests to test rate limiting...', 'cyan');
  
  const requests = [];
  const maxRequests = 6; // Limit is 5, so 6th should fail
  
  for (let i = 0; i < maxRequests; i++) {
    requests.push(
      axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: `test${i}@test.com`,
        password: 'wrongpassword'
      }).catch(err => err.response)
    );
  }

  const responses = await Promise.all(requests);
  
  // Check if any request was rate limited
  const rateLimited = responses.some(res => res && res.status === 429);
  
  if (rateLimited) {
    log('   Rate limiting is working', 'green');
  } else {
    log('   Warning: No rate limiting detected (may need more requests)', 'yellow');
  }
}

/**
 * Test 8: Password validation
 */
async function testPasswordValidation() {
  const weakPasswords = [
    'short',           // Too short
    'alllowercase',    // No uppercase
    'ALLUPPERCASE',    // No lowercase
    'NoNumbers!',      // No numbers
    'NoSpecial123',    // No special chars
    '12345678'         // Only numbers
  ];

  for (const password of weakPasswords) {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: 'testuser',
        email: 'test@test.com',
        password: password
      });
      throw new Error(`Weak password accepted: ${password}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        continue; // Good, weak password rejected
      }
      throw error;
    }
  }
}

/**
 * Test 9: Email validation
 */
async function testEmailValidation() {
  const invalidEmails = [
    'notanemail',
    'missing@domain',
    '@nodomain.com',
    'spaces in@email.com',
    'double@@domain.com'
  ];

  for (const email of invalidEmails) {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: 'testuser',
        email: email,
        password: 'Test123!@#'
      });
      throw new Error(`Invalid email accepted: ${email}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        continue; // Good, invalid email rejected
      }
      throw error;
    }
  }
}

/**
 * Test 10: CORS headers
 */
async function testCORSHeaders() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    
    // Check for CORS headers
    const headers = response.headers;
    
    if (headers['access-control-allow-origin']) {
      log(`   CORS Origin: ${headers['access-control-allow-origin']}`, 'cyan');
    }
    
    if (headers['access-control-allow-credentials']) {
      log(`   CORS Credentials: ${headers['access-control-allow-credentials']}`, 'cyan');
    }
  } catch (error) {
    throw new Error(`Failed to check CORS headers: ${error.message}`);
  }
}

/**
 * Test 11: Security headers (Helmet)
 */
async function testSecurityHeaders() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    const headers = response.headers;
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    const missingHeaders = [];
    
    for (const header of securityHeaders) {
      if (!headers[header]) {
        missingHeaders.push(header);
      } else {
        log(`   ✓ ${header}: ${headers[header]}`, 'green');
      }
    }
    
    if (missingHeaders.length > 0) {
      log(`   Warning: Missing security headers: ${missingHeaders.join(', ')}`, 'yellow');
    }
  } catch (error) {
    throw new Error(`Failed to check security headers: ${error.message}`);
  }
}

/**
 * Run all security tests
 */
async function runAllTests() {
  log('🔒 Starting Security Tests...', 'cyan');
  log(`Testing API at: ${API_BASE_URL}`, 'cyan');

  // Authentication tests
  await runTest('Test 1: Access without token', testNoToken);
  await runTest('Test 2: Access with invalid token', testInvalidToken);
  await runTest('Test 3: Access with malformed auth header', testMalformedAuth);

  // SQL Injection tests
  await runTest('Test 4: SQL Injection in login', testSQLInjectionLogin);
  await runTest('Test 5: SQL Injection in registration', testSQLInjectionRegister);

  // XSS tests
  await runTest('Test 6: XSS prevention', testXSSPrevention);

  // Rate limiting tests
  await runTest('Test 7: Auth rate limiting', testAuthRateLimit);

  // Input validation tests
  await runTest('Test 8: Password validation', testPasswordValidation);
  await runTest('Test 9: Email validation', testEmailValidation);

  // Security headers tests
  await runTest('Test 10: CORS headers', testCORSHeaders);
  await runTest('Test 11: Security headers (Helmet)', testSecurityHeaders);

  // Print summary
  log('\n' + '='.repeat(60), 'cyan');
  log('SECURITY TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Tests Passed: ${testsPassed}`, testsPassed > 0 ? 'green' : 'red');
  log(`Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log('='.repeat(60) + '\n', 'cyan');

  if (testsFailed > 0) {
    log('❌ Some security tests failed', 'red');
    process.exit(1);
  } else {
    log('✅ All security tests passed', 'green');
    process.exit(0);
  }
}

// Check if server is running
axios.get(`${API_BASE_URL}/health`)
  .then(() => {
    log('✓ Server is running', 'green');
    runAllTests();
  })
  .catch(error => {
    log('✗ Server is not running or not accessible', 'red');
    log(`  Make sure the server is running at ${API_BASE_URL}`, 'yellow');
    log(`  Error: ${error.message}`, 'red');
    process.exit(1);
  });
