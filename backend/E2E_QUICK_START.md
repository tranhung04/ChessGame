# E2E Tests - Quick Start Guide

## Prerequisites

1. **Backend server running:**
   ```bash
   cd backend
   npm start
   ```

2. **Database setup complete:**
   - SQL Server running
   - Schema created
   - Test users seeded

3. **Environment configured:**
   ```bash
   # backend/.env
   API_BASE_URL=http://localhost:3000/api
   ```

## Run Tests

### Option 1: Run All Tests (Recommended)
```bash
cd backend
node test-e2e-all.js
```

### Option 2: Run Individual Tests
```bash
# Complete user journey (Register → Login → Play → Leaderboard)
node test-e2e-user-journey.js

# Premium purchase flow (Shop → Payment → Activation)
node test-e2e-premium-purchase.js

# Offline mode (Play offline → Sync online)
node test-e2e-offline-mode.js

# Error scenarios (Network, Auth, Validation, Security)
node test-e2e-error-scenarios.js
```

## Expected Output

### Success
```
╔════════════════════════════════════════════════════════════╗
║  Test Summary                                              ║
╚════════════════════════════════════════════════════════════╝
Total Steps: 9
Passed: 9
Failed: 0
Status: ✅ ALL TESTS PASSED
```

### Failure
```
╔════════════════════════════════════════════════════════════╗
║  Test Summary                                              ║
╚════════════════════════════════════════════════════════════╝
Total Steps: 9
Passed: 5
Failed: 4
Status: ❌ SOME TESTS FAILED
```

## Common Issues

### Backend Not Running
```
❌ Login failed: connect ECONNREFUSED
```
**Fix:** Start backend with `npm start`

### Database Not Setup
```
❌ Registration failed: Database connection error
```
**Fix:** Run database setup scripts

### Test User Exists
```
❌ Registration failed: Email already exists
```
**Fix:** Tests auto-generate unique users, but you can clean up:
```sql
DELETE FROM Users WHERE Username LIKE 'e2e_test_%';
```

## Test Coverage

| Test | Steps | Duration | Coverage |
|------|-------|----------|----------|
| User Journey | 9 | ~10s | Registration to Logout |
| Premium Purchase | 7 | ~8s | Payment Flow |
| Offline Mode | 8 | ~12s | Offline Play & Sync |
| Error Scenarios | 12 | ~15s | Error Handling |

## Next Steps

- Review detailed guide: `E2E_TEST_GUIDE.md`
- Integrate with CI/CD
- Add custom test scenarios
- Monitor test results

## Support

For detailed documentation, see `E2E_TEST_GUIDE.md`
