# End-to-End Integration Test Guide

## Overview

This document describes the comprehensive end-to-end (E2E) integration tests for the ToolChess application. These tests validate complete user workflows, error handling, and system resilience.

## Test Coverage

### Task 27.1: Complete User Journey
**File:** `test-e2e-user-journey.js`

Tests the complete flow from registration to viewing leaderboard:

1. **Register** - Create new user account
2. **Login** - Authenticate with credentials
3. **Get Profile** - Retrieve user profile and stats
4. **Start Game** - Create new game session
5. **Play Game** - Simulate gameplay
6. **Submit Score** - Submit game results
7. **View History** - Check game history
8. **View Leaderboard** - See rankings
9. **Logout** - End session

**Requirements Validated:** 22.1-22.3

**Expected Outcome:** All steps complete successfully, demonstrating full user lifecycle.

### Task 27.2: Premium Purchase Flow
**File:** `test-e2e-premium-purchase.js`

Tests the premium subscription purchase workflow:

1. **Login** - Authenticate user
2. **View Shop** - Fetch available premium packages
3. **Create Payment** - Initialize VNPay payment
4. **Simulate Payment** - Mock VNPay callback
5. **Check Payment Status** - Verify payment completion
6. **Verify Premium Active** - Confirm premium subscription
7. **Test Premium Benefits** - Validate score bonuses

**Requirements Validated:** 22.1-22.3

**Expected Outcome:** Premium subscription activated and benefits applied correctly.

### Task 27.3: Offline Mode
**File:** `test-e2e-offline-mode.js`

Tests offline gameplay and synchronization:

1. **Login** - Get authentication tokens
2. **Get Premium Status** - Cache premium data
3. **Simulate Offline Mode** - Play games without network
4. **Verify Offline Gameplay** - Validate local storage
5. **Restore Connection** - Reconnect to backend
6. **Sync Offline Games** - Upload cached sessions
7. **Verify Data Integrity** - Confirm sync accuracy
8. **Verify Leaderboard** - Check rankings updated

**Requirements Validated:** 19.3, 19.4

**Expected Outcome:** Games playable offline and sync correctly when online.

### Task 27.4: Error Scenarios
**File:** `test-e2e-error-scenarios.js`

Tests error handling and security:

1. **Network Timeout** - Handle connection failures
2. **Invalid Login Credentials** - Reject bad credentials
3. **Invalid Registration Data** - Validate input
4. **Expired Token** - Handle token expiration
5. **Missing Auth Token** - Require authentication
6. **Invalid Game Submission** - Validate game data
7. **Invalid Payment Data** - Validate payment requests
8. **Rate Limit Exceeded** - Enforce rate limiting
9. **Duplicate Registration** - Prevent duplicate accounts
10. **Invalid Refresh Token** - Reject bad tokens
11. **SQL Injection Attempt** - Block SQL injection
12. **XSS Attempt** - Sanitize malicious input

**Requirements Validated:** 18.8-18.10

**Expected Outcome:** All error scenarios handled gracefully with appropriate error messages.

## Running the Tests

### Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   npm start
   ```

2. **Database Setup**
   - SQL Server running
   - Database schema created
   - Test users seeded

3. **Environment Variables**
   ```bash
   # backend/.env
   API_BASE_URL=http://localhost:3000/api
   VNPAY_SECRET_KEY=your_secret_key
   ```

### Run Individual Tests

```bash
# Complete User Journey
node backend/test-e2e-user-journey.js

# Premium Purchase Flow
node backend/test-e2e-premium-purchase.js

# Offline Mode
node backend/test-e2e-offline-mode.js

# Error Scenarios
node backend/test-e2e-error-scenarios.js
```

### Run All Tests

```bash
# Run complete test suite
node backend/test-e2e-all.js
```

## Test Output

Each test provides detailed console output:

```
╔════════════════════════════════════════════════════════════╗
║  End-to-End Integration Test: Complete User Journey       ║
╚════════════════════════════════════════════════════════════╝

=== Step 1: Register New User ===
✅ Registration successful
   User ID: abc-123-def
   Username: e2e_test_user
   Tokens received

=== Step 2: Login with Credentials ===
✅ Login successful
   New tokens received
   User: e2e_test_user
   Email: e2e_test@test.com

...

╔════════════════════════════════════════════════════════════╗
║  Test Summary                                              ║
╚════════════════════════════════════════════════════════════╝
Total Steps: 9
Passed: 9
Failed: 0
Status: ✅ ALL TESTS PASSED
```

## Interpreting Results

### Success Indicators

- ✅ Green checkmarks for passed steps
- All steps complete without errors
- Exit code 0

### Failure Indicators

- ❌ Red X marks for failed steps
- Error messages with details
- Exit code 1

### Common Issues

#### 1. Backend Not Running
```
❌ Login failed: connect ECONNREFUSED
```
**Solution:** Start the backend server

#### 2. Database Not Setup
```
❌ Registration failed: Database connection error
```
**Solution:** Run database setup scripts

#### 3. Test User Already Exists
```
❌ Registration failed: Email already exists
```
**Solution:** Use unique test user prefix or clean database

#### 4. Rate Limiting
```
⚠️ No rate limiting detected
```
**Note:** This is a warning, not a failure. Rate limiting may need configuration.

## Test Data Management

### Test User Creation

Tests create unique users with timestamp prefixes:
```javascript
const TEST_USER_PREFIX = `e2e_test_${Date.now()}`;
```

### Cleanup

After testing, you may want to clean up test data:

```sql
-- Remove test users
DELETE FROM Users WHERE Username LIKE 'e2e_test_%';

-- Remove test game sessions
DELETE FROM GameSessions WHERE UserId IN (
  SELECT Id FROM Users WHERE Username LIKE 'e2e_test_%'
);
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2019-latest
        env:
          ACCEPT_EULA: Y
          SA_PASSWORD: YourStrong@Passw0rd
        ports:
          - 1433:1433
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Setup database
        run: |
          # Run database setup scripts
          sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -i database/setup.sql
      
      - name: Start backend
        run: |
          cd backend
          npm start &
          sleep 10
      
      - name: Run E2E tests
        run: |
          cd backend
          node test-e2e-all.js
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use unique test data per run
- Clean up after tests (optional)

### 2. Error Handling
- Tests should handle network failures gracefully
- Provide clear error messages
- Don't fail on warnings

### 3. Timing
- Add delays between API calls to avoid rate limiting
- Wait for async operations to complete
- Use reasonable timeouts

### 4. Assertions
- Verify response status codes
- Check response data structure
- Validate business logic

### 5. Documentation
- Comment complex test logic
- Document expected outcomes
- Note any test dependencies

## Troubleshooting

### Test Hangs

If a test hangs indefinitely:
1. Check if backend is responding
2. Verify database connection
3. Check for infinite loops in test code
4. Increase timeout values

### Intermittent Failures

If tests fail randomly:
1. Add delays between steps
2. Check for race conditions
3. Verify database state
4. Check network stability

### All Tests Fail

If all tests fail immediately:
1. Verify backend is running
2. Check API_BASE_URL configuration
3. Verify database is accessible
4. Check environment variables

## Extending the Tests

### Adding New Test Scenarios

1. Create new test file: `test-e2e-your-scenario.js`
2. Follow existing test structure
3. Add to `test-e2e-all.js`
4. Update this documentation

### Test Template

```javascript
/**
 * End-to-End Integration Test: Your Scenario
 * Tests: Description of what you're testing
 * Requirements: X.Y
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

async function apiCall(method, endpoint, data = null, useAuth = false) {
  // ... helper function
}

async function step1_YourStep() {
  console.log('\n=== Step 1: Your Step ===');
  // ... test logic
  return true; // or false
}

async function runE2ETest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  End-to-End Integration Test: Your Scenario               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const steps = [
    { name: 'Your Step', fn: step1_YourStep }
  ];
  
  // ... run steps and report results
}

runE2ETest().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
```

## Maintenance

### Regular Updates

- Update tests when API changes
- Add tests for new features
- Remove tests for deprecated features
- Keep documentation current

### Performance

- Monitor test execution time
- Optimize slow tests
- Parallelize independent tests (carefully)
- Use test data efficiently

## Support

For issues or questions:
1. Check this documentation
2. Review test output carefully
3. Check backend logs
4. Verify database state
5. Contact development team

## Conclusion

These E2E tests provide comprehensive coverage of the ToolChess application, ensuring that all critical user workflows function correctly and that the system handles errors gracefully. Regular execution of these tests helps maintain system quality and catch regressions early.
