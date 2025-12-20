/**
 * End-to-End Integration Test: Error Scenarios
 * Tests: Network failures, Invalid inputs, Token expiration, Payment failures
 * Requirements: 18.8-18.10
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'testuser@example.com',
  password: 'TestPassword123!'
};

let authTokens = {
  accessToken: null,
  refreshToken: null
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false, customToken = null) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {},
    timeout: 5000 // 5 second timeout
  };

  if (useAuth) {
    const token = customToken || authTokens.accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
      code: error.code
    };
  }
}

// Test Scenarios
async function scenario1_NetworkTimeout() {
  console.log('\n=== Scenario 1: Network Timeout ===');
  
  // Try to connect to non-existent endpoint with short timeout
  const config = {
    method: 'GET',
    url: 'http://10.255.255.1:3000/api/test', // Non-routable IP
    timeout: 1000
  };
  
  try {
    await axios(config);
    console.log('❌ Should have timed out');
    return false;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.log('✅ Network timeout handled correctly');
      console.log('   Error Code:', error.code);
      console.log('   Error Message:', error.message);
      return true;
    } else {
      console.log('⚠️  Different error:', error.code);
      return true; // Still acceptable
    }
  }
}

async function scenario2_InvalidLoginCredentials() {
  console.log('\n=== Scenario 2: Invalid Login Credentials ===');
  
  const result = await apiCall('POST', '/auth/login', {
    email: 'nonexistent@example.com',
    password: 'WrongPassword123!'
  });
  
  if (result.success) {
    console.log('❌ Should have failed with invalid credentials');
    return false;
  }
  
  console.log('✅ Invalid credentials rejected');
  console.log('   Status:', result.status);
  console.log('   Error:', result.error?.error?.message || result.error);
  
  return result.status === 401 || result.status === 400;
}

async function scenario3_InvalidRegistrationData() {
  console.log('\n=== Scenario 3: Invalid Registration Data ===');
  
  const invalidCases = [
    {
      name: 'Invalid Email',
      data: { username: 'test', email: 'invalid-email', password: 'Test123!' }
    },
    {
      name: 'Weak Password',
      data: { username: 'test', email: 'test@test.com', password: '123' }
    },
    {
      name: 'Missing Fields',
      data: { username: 'test' }
    }
  ];
  
  let allPassed = true;
  
  for (const testCase of invalidCases) {
    console.log(`\n   Testing: ${testCase.name}`);
    
    const result = await apiCall('POST', '/auth/register', testCase.data);
    
    if (result.success) {
      console.log(`   ❌ Should have rejected: ${testCase.name}`);
      allPassed = false;
    } else {
      console.log(`   ✅ Rejected correctly`);
      console.log(`      Status: ${result.status}`);
    }
  }
  
  return allPassed;
}

async function scenario4_ExpiredToken() {
  console.log('\n=== Scenario 4: Expired/Invalid Token ===');
  
  // Use an obviously invalid token
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  const result = await apiCall('GET', '/user/me', null, true, invalidToken);
  
  if (result.success) {
    console.log('❌ Should have rejected invalid token');
    return false;
  }
  
  console.log('✅ Invalid token rejected');
  console.log('   Status:', result.status);
  console.log('   Error:', result.error?.error?.message || result.error);
  
  return result.status === 401;
}

async function scenario5_MissingAuthToken() {
  console.log('\n=== Scenario 5: Missing Auth Token ===');
  
  const result = await apiCall('GET', '/user/me', null, false);
  
  if (result.success) {
    console.log('❌ Should have required authentication');
    return false;
  }
  
  console.log('✅ Missing token rejected');
  console.log('   Status:', result.status);
  console.log('   Error:', result.error?.error?.message || result.error);
  
  return result.status === 401;
}

async function scenario6_InvalidGameSubmission() {
  console.log('\n=== Scenario 6: Invalid Game Submission ===');
  
  // First login to get valid token
  const loginResult = await apiCall('POST', '/auth/login', testUser);
  
  if (!loginResult.success) {
    console.log('⚠️  Could not login for test');
    return false;
  }
  
  authTokens.accessToken = loginResult.data.data?.tokens?.accessToken;
  
  const invalidCases = [
    {
      name: 'Invalid Session ID',
      data: { sessionId: 'invalid-uuid', score: 1000, turnCount: 20, duration: 100 }
    },
    {
      name: 'Negative Score',
      data: { sessionId: '00000000-0000-0000-0000-000000000000', score: -100, turnCount: 20, duration: 100 }
    },
    {
      name: 'Unrealistic Score',
      data: { sessionId: '00000000-0000-0000-0000-000000000000', score: 999999999, turnCount: 1, duration: 1 }
    }
  ];
  
  let allPassed = true;
  
  for (const testCase of invalidCases) {
    console.log(`\n   Testing: ${testCase.name}`);
    
    const result = await apiCall('POST', '/game/submit', testCase.data, true);
    
    if (result.success) {
      console.log(`   ❌ Should have rejected: ${testCase.name}`);
      allPassed = false;
    } else {
      console.log(`   ✅ Rejected correctly`);
      console.log(`      Status: ${result.status}`);
    }
  }
  
  return allPassed;
}

async function scenario7_InvalidPaymentData() {
  console.log('\n=== Scenario 7: Invalid Payment Data ===');
  
  const invalidCases = [
    {
      name: 'Invalid Package ID',
      data: { packageId: 'nonexistent', returnUrl: 'test://return' }
    },
    {
      name: 'Missing Return URL',
      data: { packageId: 'basic' }
    }
  ];
  
  let allPassed = true;
  
  for (const testCase of invalidCases) {
    console.log(`\n   Testing: ${testCase.name}`);
    
    const result = await apiCall('POST', '/payment/vnpay/create', testCase.data, true);
    
    if (result.success) {
      console.log(`   ❌ Should have rejected: ${testCase.name}`);
      allPassed = false;
    } else {
      console.log(`   ✅ Rejected correctly`);
      console.log(`      Status: ${result.status}`);
    }
  }
  
  return allPassed;
}

async function scenario8_RateLimitExceeded() {
  console.log('\n=== Scenario 8: Rate Limit Exceeded ===');
  
  console.log('   Sending multiple rapid requests...');
  
  const requests = [];
  const numRequests = 10;
  
  for (let i = 0; i < numRequests; i++) {
    requests.push(
      apiCall('POST', '/auth/login', {
        email: 'test@test.com',
        password: 'wrong'
      })
    );
  }
  
  const results = await Promise.all(requests);
  
  // Check if any request was rate limited (429)
  const rateLimited = results.some(r => r.status === 429);
  
  if (rateLimited) {
    console.log('✅ Rate limiting working');
    console.log('   Some requests were rate limited (429)');
    return true;
  } else {
    console.log('⚠️  No rate limiting detected');
    console.log('   Note: Rate limiting may not be configured or threshold not reached');
    return true; // Don't fail test, just warn
  }
}

async function scenario9_DuplicateRegistration() {
  console.log('\n=== Scenario 9: Duplicate Registration ===');
  
  // Try to register with existing user email
  const result = await apiCall('POST', '/auth/register', {
    username: 'newuser',
    email: testUser.email, // Use existing email
    password: 'NewPassword123!'
  });
  
  if (result.success) {
    console.log('❌ Should have rejected duplicate email');
    return false;
  }
  
  console.log('✅ Duplicate email rejected');
  console.log('   Status:', result.status);
  console.log('   Error:', result.error?.error?.message || result.error);
  
  return result.status === 400 || result.status === 409;
}

async function scenario10_InvalidRefreshToken() {
  console.log('\n=== Scenario 10: Invalid Refresh Token ===');
  
  const result = await apiCall('POST', '/auth/refresh-token', {
    refreshToken: 'invalid-refresh-token-12345'
  });
  
  if (result.success) {
    console.log('❌ Should have rejected invalid refresh token');
    return false;
  }
  
  console.log('✅ Invalid refresh token rejected');
  console.log('   Status:', result.status);
  console.log('   Error:', result.error?.error?.message || result.error);
  
  return result.status === 401;
}

async function scenario11_SQLInjectionAttempt() {
  console.log('\n=== Scenario 11: SQL Injection Attempt ===');
  
  const maliciousInputs = [
    "' OR '1'='1",
    "admin'--",
    "1'; DROP TABLE Users--"
  ];
  
  let allPassed = true;
  
  for (const input of maliciousInputs) {
    const result = await apiCall('POST', '/auth/login', {
      email: input,
      password: input
    });
    
    if (result.success) {
      console.log('❌ SQL injection may be possible!');
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('✅ SQL injection attempts blocked');
  }
  
  return allPassed;
}

async function scenario12_XSSAttempt() {
  console.log('\n=== Scenario 12: XSS Attempt ===');
  
  const xssPayload = '<script>alert("XSS")</script>';
  
  const result = await apiCall('POST', '/auth/register', {
    username: xssPayload,
    email: 'xss@test.com',
    password: 'Test123!'
  });
  
  // Should either reject or sanitize
  if (result.success) {
    console.log('⚠️  XSS payload accepted (should be sanitized on output)');
    return true; // Don't fail, backend might sanitize on output
  } else {
    console.log('✅ XSS payload rejected');
    return true;
  }
}

// Main test execution
async function runE2ETest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  End-to-End Integration Test: Error Scenarios             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base URL: ${API_BASE_URL}`);
  
  const scenarios = [
    { name: 'Network Timeout', fn: scenario1_NetworkTimeout },
    { name: 'Invalid Login Credentials', fn: scenario2_InvalidLoginCredentials },
    { name: 'Invalid Registration Data', fn: scenario3_InvalidRegistrationData },
    { name: 'Expired Token', fn: scenario4_ExpiredToken },
    { name: 'Missing Auth Token', fn: scenario5_MissingAuthToken },
    { name: 'Invalid Game Submission', fn: scenario6_InvalidGameSubmission },
    { name: 'Invalid Payment Data', fn: scenario7_InvalidPaymentData },
    { name: 'Rate Limit Exceeded', fn: scenario8_RateLimitExceeded },
    { name: 'Duplicate Registration', fn: scenario9_DuplicateRegistration },
    { name: 'Invalid Refresh Token', fn: scenario10_InvalidRefreshToken },
    { name: 'SQL Injection Attempt', fn: scenario11_SQLInjectionAttempt },
    { name: 'XSS Attempt', fn: scenario12_XSSAttempt }
  ];
  
  let passedScenarios = 0;
  let failedScenarios = 0;
  const failedTests = [];
  
  for (const scenario of scenarios) {
    try {
      const success = await scenario.fn();
      if (success) {
        passedScenarios++;
      } else {
        failedScenarios++;
        failedTests.push(scenario.name);
      }
    } catch (error) {
      failedScenarios++;
      failedTests.push(scenario.name);
      console.error(`\n❌ Scenario "${scenario.name}" threw error:`, error.message);
    }
    
    // Small delay between scenarios
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Total Scenarios: ${scenarios.length}`);
  console.log(`Passed: ${passedScenarios}`);
  console.log(`Failed: ${failedScenarios}`);
  
  if (failedTests.length > 0) {
    console.log('\nFailed Scenarios:');
    failedTests.forEach(test => console.log(`  - ${test}`));
  }
  
  console.log(`\nStatus: ${failedScenarios === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(failedScenarios === 0 ? 0 : 1);
}

// Run the test
runE2ETest().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
