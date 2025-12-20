# ToolChess Rebuild - Manual Test Checklist

## Overview
This document provides a comprehensive manual testing checklist for the ToolChess Rebuild application. Follow this checklist to verify all features work correctly before deployment.

**Test Date:** _____________
**Tester Name:** _____________
**Environment:** [ ] Development [ ] Staging [ ] Production
**Device:** _____________
**OS Version:** _____________

---

## 1. Authentication Tests

### 1.1 User Registration
- [ ] **Test:** Register with valid data (username, email, password)
  - **Expected:** Success message, user created, tokens returned
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Register with duplicate email
  - **Expected:** Error "Email already registered"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Register with weak password (< 8 chars)
  - **Expected:** Error "Password must be at least 8 characters"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Register with invalid email format
  - **Expected:** Error "Invalid email format"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Register with missing required fields
  - **Expected:** Validation errors for missing fields
  - **Result:** _______________
  - **Notes:** _______________

### 1.2 User Login
- [ ] **Test:** Login with valid credentials
  - **Expected:** Success, access token + refresh token returned
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Login with invalid email
  - **Expected:** Error "Invalid credentials"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Login with invalid password
  - **Expected:** Error "Invalid credentials"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Login with non-existent account
  - **Expected:** Error "Invalid credentials"
  - **Result:** _______________
  - **Notes:** _______________

### 1.3 Token Management
- [ ] **Test:** Access protected endpoint with valid token
  - **Expected:** Success, data returned
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Access protected endpoint with expired token
  - **Expected:** 401 error, token expired message
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Refresh token with valid refresh token
  - **Expected:** New access token + refresh token returned
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Refresh token with invalid refresh token
  - **Expected:** Error "Invalid refresh token"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Refresh token with expired refresh token
  - **Expected:** Error "Refresh token expired"
  - **Result:** _______________
  - **Notes:** _______________

### 1.4 Logout
- [ ] **Test:** Logout with valid refresh token
  - **Expected:** Success, token revoked, redirected to login
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Try to use revoked refresh token
  - **Expected:** Error "Token has been revoked"
  - **Result:** _______________
  - **Notes:** _______________

---

## 2. User Profile Tests

### 2.1 View Profile
- [ ] **Test:** Get user profile (GET /api/user/me)
  - **Expected:** User data with stats and premium status
  - **Result:** _______________
  - **Notes:** _______________

### 2.2 Update Profile
- [ ] **Test:** Update username
  - **Expected:** Success, username updated
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Update email
  - **Expected:** Success, email updated
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Update with duplicate username
  - **Expected:** Error "Username already taken"
  - **Result:** _______________
  - **Notes:** _______________

---

## 3. Game Flow Tests

### 3.1 Start Game
- [ ] **Test:** Start new game session
  - **Expected:** Session created, session ID returned
  - **Result:** _______________
  - **Notes:** _______________

### 3.2 Setup Phase
- [ ] **Test:** Place player Xe on board
  - **Expected:** Xe placed at selected position
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Enemy pieces spawn automatically
  - **Expected:** 7 enemy pieces appear on board
  - **Result:** _______________
  - **Notes:** _______________

### 3.3 Playing Phase
- [ ] **Test:** Select player Xe
  - **Expected:** Xe highlighted, valid moves shown
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Move Xe to valid position
  - **Expected:** Xe moves, turn switches to enemy
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Try to move Xe to invalid position
  - **Expected:** Move rejected, error message shown
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Capture enemy piece
  - **Expected:** Enemy removed, score increased
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Capture Tướng địch (enemy general)
  - **Expected:** Fire mode activated, indicator shown
  - **Result:** _______________
  - **Notes:** _______________

### 3.4 Fire Mode
- [ ] **Test:** Move during fire mode
  - **Expected:** Adjacent enemies destroyed, bonus points
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Fire mode lasts 3 turns
  - **Expected:** Fire mode deactivates after 3 turns
  - **Result:** _______________
  - **Notes:** _______________

### 3.5 Enemy AI Turn
- [ ] **Test:** Enemy AI selects and executes move
  - **Expected:** Enemy piece moves, turn returns to player
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Enemy AI attacks player Xe when possible
  - **Expected:** AI prioritizes attacking moves
  - **Result:** _______________
  - **Notes:** _______________

### 3.6 Game End
- [ ] **Test:** Player Xe captured by enemy
  - **Expected:** Game ends, final score shown
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** No valid moves available
  - **Expected:** Game ends, final score shown
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Submit game score
  - **Expected:** Score saved to database, rank shown
  - **Result:** _______________
  - **Notes:** _______________

### 3.7 Game History
- [ ] **Test:** View game history
  - **Expected:** List of past games with scores and dates
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Pagination in game history
  - **Expected:** Load more games when scrolling
  - **Result:** _______________
  - **Notes:** _______________

### 3.8 Leaderboard
- [ ] **Test:** View leaderboard
  - **Expected:** Top players sorted by score
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Current user highlighted in leaderboard
  - **Expected:** User's rank and score highlighted
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Premium badges shown on leaderboard
  - **Expected:** Premium users have badge indicator
  - **Result:** _______________
  - **Notes:** _______________

---

## 4. Premium Package Tests

### 4.1 View Packages
- [ ] **Test:** View all premium packages
  - **Expected:** 4 packages displayed (Basic, Standard, Pro, VIP)
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Package details shown correctly
  - **Expected:** Name, price, duration, bonus, revives, features
  - **Result:** _______________
  - **Notes:** _______________

### 4.2 Premium Status
- [ ] **Test:** Check premium status (no premium)
  - **Expected:** isPremium: false, no bonus shown
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Check premium status (active premium)
  - **Expected:** isPremium: true, bonus percentage shown
  - **Result:** _______________
  - **Notes:** _______________

### 4.3 Premium Bonus in Game
- [ ] **Test:** Play game with active premium
  - **Expected:** Score multiplier applied, bonus indicator shown
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Verify bonus calculation
  - **Expected:** Final score = base score × (1 + bonus %)
  - **Result:** _______________
  - **Notes:** _______________

---

## 5. Payment Integration Tests (VNPay)

### 5.1 Create Payment
- [ ] **Test:** Select package and click "Buy Now"
  - **Expected:** Payment URL generated and returned
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Payment URL opens in WebView
  - **Expected:** VNPay payment page loads
  - **Result:** _______________
  - **Notes:** _______________

### 5.2 Complete Payment (Sandbox)
- [ ] **Test:** Complete payment with test card
  - **Expected:** Payment successful, redirected back to app
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Premium activated after payment
  - **Expected:** Premium status updated, subscription active
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Payment confirmation email sent
  - **Expected:** Email received with order details
  - **Result:** _______________
  - **Notes:** _______________

### 5.3 Payment Status Polling
- [ ] **Test:** App polls payment status after return
  - **Expected:** Status updates from pending to completed
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Success message shown when payment completes
  - **Expected:** "Payment successful" message displayed
  - **Result:** _______________
  - **Notes:** _______________

### 5.4 Failed Payment
- [ ] **Test:** Cancel payment on VNPay page
  - **Expected:** Payment status: failed, no premium activated
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Error message shown for failed payment
  - **Expected:** "Payment failed" message displayed
  - **Result:** _______________
  - **Notes:** _______________

### 5.5 Payment Security
- [ ] **Test:** Callback with invalid signature
  - **Expected:** Payment rejected, error logged
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Duplicate payment callback
  - **Expected:** Idempotent, no duplicate activation
  - **Result:** _______________
  - **Notes:** _______________

---

## 6. Email Service Tests

### 6.1 Verification Email
- [ ] **Test:** Send verification email on registration
  - **Expected:** Email received with verification link
  - **Result:** _______________
  - **Notes:** _______________

### 6.2 Password Reset Email
- [ ] **Test:** Request password reset
  - **Expected:** Email received with reset link
  - **Result:** _______________
  - **Notes:** _______________

### 6.3 Payment Confirmation Email
- [ ] **Test:** Complete payment
  - **Expected:** Email received with order details
  - **Result:** _______________
  - **Notes:** _______________

### 6.4 Email Delivery
- [ ] **Test:** Check email in inbox (not spam)
  - **Expected:** Email in inbox, not spam folder
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Email formatting correct
  - **Expected:** HTML renders correctly, links work
  - **Result:** _______________
  - **Notes:** _______________

---

## 7. Security Tests

### 7.1 Authentication Security
- [ ] **Test:** Access endpoint without token
  - **Expected:** 401 Unauthorized
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Access endpoint with tampered token
  - **Expected:** 401 Invalid token
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** SQL injection attempt in login
  - **Expected:** Input sanitized, no SQL error
  - **Result:** _______________
  - **Notes:** _______________

### 7.2 Rate Limiting
- [ ] **Test:** Exceed rate limit on login endpoint (5 req/min)
  - **Expected:** 429 Too Many Requests after 5 attempts
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Exceed rate limit on payment endpoint (3 req/min)
  - **Expected:** 429 Too Many Requests after 3 attempts
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Exceed rate limit on game submission (10 games/hour)
  - **Expected:** 429 Too Many Requests after 10 games
  - **Result:** _______________
  - **Notes:** _______________

### 7.3 Input Validation
- [ ] **Test:** XSS attempt in username
  - **Expected:** Input sanitized, no script execution
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Invalid data types in API requests
  - **Expected:** Validation error, request rejected
  - **Result:** _______________
  - **Notes:** _______________

---

## 8. Anti-Cheat Tests

### 8.1 Score Validation
- [ ] **Test:** Submit score exceeding maximum possible
  - **Expected:** Error "Invalid score"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Submit negative score
  - **Expected:** Error "Invalid score"
  - **Result:** _______________
  - **Notes:** _______________

### 8.2 Session Validation
- [ ] **Test:** Submit score for non-existent session
  - **Expected:** Error "Invalid session"
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Submit score twice for same session
  - **Expected:** Error "Session already completed"
  - **Result:** _______________
  - **Notes:** _______________

---

## 9. Offline Mode Tests

### 9.1 Play Offline
- [ ] **Test:** Disable network, start game
  - **Expected:** Game works offline, no API calls
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Complete game offline
  - **Expected:** Game ends, score saved locally
  - **Result:** _______________
  - **Notes:** _______________

### 9.2 Sync When Online
- [ ] **Test:** Re-enable network
  - **Expected:** Pending scores synced to server
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Offline indicator shown
  - **Expected:** Clear indicator when offline
  - **Result:** _______________
  - **Notes:** _______________

---

## 10. UI/UX Tests

### 10.1 Navigation
- [ ] **Test:** Navigate between all screens
  - **Expected:** Smooth transitions, no crashes
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Back button behavior
  - **Expected:** Correct navigation stack behavior
  - **Result:** _______________
  - **Notes:** _______________

### 10.2 Loading States
- [ ] **Test:** Loading indicators during API calls
  - **Expected:** Spinner/loading shown during requests
  - **Result:** _______________
  - **Notes:** _______________

### 10.3 Error Messages
- [ ] **Test:** User-friendly error messages
  - **Expected:** Clear, actionable error messages
  - **Result:** _______________
  - **Notes:** _______________

### 10.4 Responsive Design
- [ ] **Test:** App on different screen sizes
  - **Expected:** UI adapts correctly to screen size
  - **Result:** _______________
  - **Notes:** _______________

---

## 11. Performance Tests

### 11.1 App Performance
- [ ] **Test:** App startup time
  - **Expected:** < 3 seconds to main screen
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Game rendering performance
  - **Expected:** Smooth 60fps gameplay
  - **Result:** _______________
  - **Notes:** _______________

### 11.2 API Performance
- [ ] **Test:** API response times
  - **Expected:** < 500ms for most endpoints
  - **Result:** _______________
  - **Notes:** _______________

- [ ] **Test:** Leaderboard loading
  - **Expected:** < 1 second to load
  - **Result:** _______________
  - **Notes:** _______________

---

## 12. Device-Specific Tests

### 12.1 Android Tests
- [ ] **Test:** App on Android device
  - **Device Model:** _______________
  - **Android Version:** _______________
  - **Result:** _______________
  - **Notes:** _______________

### 12.2 iOS Tests (if applicable)
- [ ] **Test:** App on iOS device
  - **Device Model:** _______________
  - **iOS Version:** _______________
  - **Result:** _______________
  - **Notes:** _______________

---

## Test Summary

**Total Tests:** _______________
**Passed:** _______________
**Failed:** _______________
**Blocked:** _______________

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Non-Critical Issues Found
1. _______________
2. _______________
3. _______________

### Recommendations
1. _______________
2. _______________
3. _______________

---

## Sign-Off

**Tester Signature:** _______________
**Date:** _______________

**Approved for Deployment:** [ ] Yes [ ] No

**Approver Name:** _______________
**Approver Signature:** _______________
**Date:** _______________
