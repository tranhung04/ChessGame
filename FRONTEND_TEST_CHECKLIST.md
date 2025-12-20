# Frontend Testing Checklist - ToolChess Rebuild

## Test Execution Date: December 20, 2024

## Overview
This document provides a comprehensive manual testing checklist for the ToolChess mobile application frontend. All tests should be performed on both Android and iOS devices (if applicable).

---

## 1. Game Engine Tests ✅

### 1.1 Unit Tests
- [x] **Board Initialization** - PASSED
  - 9x8 empty board created correctly
  - Game starts in setup mode
  - No player Xe initially
  - Zero score initially

- [x] **Piece Placement** - PASSED
  - Player Xe placement works
  - Enemy piece placement works
  - Invalid position rejection works

- [x] **Position Validation** - PASSED
  - Valid positions accepted
  - Out-of-bounds positions rejected

- [x] **Score Calculation** - PASSED
  - Base score calculation correct
  - Premium bonus applied correctly

- [x] **Player Xe Movement** - PASSED
  - Valid moves calculated in all 4 directions
  - Move execution works
  - Enemy capture and score update works

- [x] **Enemy Piece Movement** - PASSED
  - Tốt (Pawn) moves 1 step in 4 directions
  - Sĩ (Advisor) moves 1 step diagonally
  - Tượng (Elephant) moves 2 steps diagonally
  - Mã (Horse) moves in L-shape

- [x] **Fire Mode** - PASSED
  - Activates when capturing Tướng địch
  - Burns enemy pieces in 4 directions
  - Awards double score for burned pieces

- [x] **Game State Management** - PASSED
  - Get state works correctly
  - State validation works

- [x] **Game Flow** - PASSED
  - Setup to playing transition works
  - Turn switching works
  - Game over detection works

- [x] **Enemy AI** - PASSED
  - Move categorization correct
  - Attack prioritization works

- [x] **Reset Game** - PASSED
  - All game state resets correctly

**Total: 29/29 tests passed**

### 1.2 Integration Tests
- [x] **Complete Game Flow** - PASSED
  - Game initialization
  - Player Xe placement
  - Game start
  - Enemy spawning (14 enemies)
  - Player move execution
  - Enemy AI turn
  - Game state validation
  - Game end

---

## 2. Authentication Flow Tests

### 2.1 Registration Screen
- [ ] **UI Elements Present**
  - [ ] Username input field
  - [ ] Email input field
  - [ ] Password input field
  - [ ] Confirm password input field
  - [ ] Register button
  - [ ] Link to login screen

- [ ] **Input Validation**
  - [ ] Empty fields show error
  - [ ] Invalid email format rejected
  - [ ] Password mismatch detected
  - [ ] Weak password rejected

- [ ] **Registration Flow**
  - [ ] Successful registration with valid data
  - [ ] Duplicate email rejected
  - [ ] Loading state shown during request
  - [ ] Error messages displayed correctly
  - [ ] Redirect to home after success

### 2.2 Login Screen
- [ ] **UI Elements Present**
  - [ ] Email input field
  - [ ] Password input field
  - [ ] Login button
  - [ ] Link to register screen
  - [ ] Google Sign-In button (if implemented)

- [ ] **Login Flow**
  - [ ] Successful login with valid credentials
  - [ ] Invalid credentials rejected
  - [ ] Loading state shown during request
  - [ ] Error messages displayed correctly
  - [ ] Redirect to home after success

- [ ] **Token Management**
  - [ ] Access token stored securely
  - [ ] Refresh token stored securely
  - [ ] Tokens persist after app restart

### 2.3 Token Refresh
- [ ] **Automatic Refresh**
  - [ ] 401 error triggers refresh
  - [ ] Original request retried after refresh
  - [ ] Single-flight pattern prevents multiple refreshes
  - [ ] Failed refresh logs user out

### 2.4 Logout
- [ ] **Logout Flow**
  - [ ] Logout button works
  - [ ] Tokens cleared from storage
  - [ ] Redirect to login screen
  - [ ] Backend refresh token revoked

---

## 3. Home Screen Tests

### 3.1 UI Elements
- [ ] **Display Elements**
  - [ ] User statistics shown (total games, highest score)
  - [ ] Premium status badge (if active)
  - [ ] "Play Now" button
  - [ ] "Leaderboard" button
  - [ ] "Shop" button

### 3.2 Navigation
- [ ] **Button Actions**
  - [ ] "Play Now" navigates to GameScreen
  - [ ] "Leaderboard" navigates to LeaderboardScreen
  - [ ] "Shop" navigates to ShopScreen

### 3.3 Data Loading
- [ ] **User Data**
  - [ ] Statistics load correctly
  - [ ] Premium status displays correctly
  - [ ] Loading state shown while fetching

---

## 4. Game Screen Tests

### 4.1 UI Components
- [ ] **ChessBoard Component**
  - [ ] 9x8 grid renders correctly
  - [ ] Pieces display at correct positions
  - [ ] Chinese chess symbols render correctly
  - [ ] Cell press events work
  - [ ] Selected piece highlighted
  - [ ] Valid moves highlighted

- [ ] **ChessPiece Component**
  - [ ] Player pieces colored correctly
  - [ ] Enemy pieces colored correctly
  - [ ] Selection highlight works
  - [ ] Symbols display correctly (車, 卒, 士, 象, 馬, 砲, 將)

- [ ] **GameControls Component**
  - [ ] Start game button works
  - [ ] Reset game button works
  - [ ] Use revive button works (if premium)
  - [ ] Revive count displays correctly
  - [ ] Buttons enable/disable based on state

- [ ] **GameInfo Component**
  - [ ] Current score displays
  - [ ] Premium bonus indicator shows (if active)
  - [ ] Turn count displays
  - [ ] Fire mode status shows

### 4.2 Game Flow
- [ ] **Setup Phase**
  - [ ] Tap to place player Xe
  - [ ] Enemies spawn after placement
  - [ ] Game transitions to playing mode

- [ ] **Playing Phase**
  - [ ] Tap to select piece
  - [ ] Tap to move to valid position
  - [ ] Enemy turn executes automatically
  - [ ] Score updates on capture
  - [ ] Fire mode activates correctly

- [ ] **Game End**
  - [ ] Game ends when Xe captured
  - [ ] Game ends when no valid moves
  - [ ] Final score submitted to backend
  - [ ] Success/failure message shown

### 4.3 API Integration
- [ ] **Game Session**
  - [ ] POST /api/game/start called on start
  - [ ] Session ID received and stored
  - [ ] POST /api/game/submit called on end
  - [ ] Score submitted correctly
  - [ ] Premium bonus applied

### 4.4 Offline Mode
- [ ] **Offline Gameplay**
  - [ ] Game works without network
  - [ ] Score saved locally
  - [ ] Sync when network restored

---

## 5. Shop Screen Tests

### 5.1 UI Elements
- [ ] **Package Display**
  - [ ] All premium packages shown
  - [ ] Package name displayed
  - [ ] Price displayed
  - [ ] Duration displayed
  - [ ] Score bonus displayed
  - [ ] Revive count displayed
  - [ ] Features list displayed
  - [ ] "Buy Now" button for each package

### 5.2 Payment Flow
- [ ] **Purchase Process**
  - [ ] Tap "Buy Now" creates payment
  - [ ] Payment URL received
  - [ ] WebView opens with payment URL
  - [ ] Payment form loads correctly
  - [ ] Return to app after payment

- [ ] **Payment Status**
  - [ ] App polls payment status
  - [ ] Success message shown on completion
  - [ ] Failure message shown on error
  - [ ] Premium status updates on success

### 5.3 Error Handling
- [ ] **Error Scenarios**
  - [ ] Network error handled
  - [ ] Payment creation failure handled
  - [ ] Payment timeout handled
  - [ ] User cancellation handled

---

## 6. Profile Screen Tests

### 6.1 UI Elements
- [ ] **User Information**
  - [ ] Username displayed
  - [ ] Email displayed
  - [ ] Game statistics shown
  - [ ] Premium info shown (if active)
  - [ ] "Logout" button
  - [ ] "Game History" button
  - [ ] "Transaction History" button

### 6.2 Actions
- [ ] **Navigation**
  - [ ] "Game History" navigates to HistoryScreen
  - [ ] "Transaction History" navigates to TransactionsScreen

- [ ] **Logout**
  - [ ] Logout button works
  - [ ] Confirmation dialog shown (optional)
  - [ ] Tokens cleared
  - [ ] Redirect to login

### 6.3 Data Loading
- [ ] **Profile Data**
  - [ ] User data loads correctly
  - [ ] Statistics accurate
  - [ ] Premium status correct
  - [ ] Loading state shown

---

## 7. Leaderboard Screen Tests

### 7.1 UI Elements
- [ ] **Leaderboard Display**
  - [ ] Rank column
  - [ ] Username column
  - [ ] Score column
  - [ ] Premium badge column
  - [ ] Current user highlighted

### 7.2 Functionality
- [ ] **Data Loading**
  - [ ] Leaderboard loads on mount
  - [ ] Pull to refresh works
  - [ ] Pagination works (if implemented)
  - [ ] Loading state shown

- [ ] **Sorting**
  - [ ] Players sorted by score (highest first)
  - [ ] Rank numbers correct

### 7.3 Premium Badges
- [ ] **Badge Display**
  - [ ] Premium users have badge
  - [ ] Non-premium users have no badge
  - [ ] Badge styling correct

---

## 8. History Screen Tests

### 8.1 UI Elements
- [ ] **Session List**
  - [ ] Session date/time
  - [ ] Score
  - [ ] Duration
  - [ ] Premium applied indicator
  - [ ] Mode (normal/premium)

### 8.2 Functionality
- [ ] **Data Loading**
  - [ ] History loads on mount
  - [ ] Pull to refresh works
  - [ ] Pagination works
  - [ ] Loading state shown

- [ ] **Empty State**
  - [ ] Message shown when no history
  - [ ] Prompt to play game

---

## 9. Transactions Screen Tests

### 9.1 UI Elements
- [ ] **Transaction List**
  - [ ] Transaction date/time
  - [ ] Package name
  - [ ] Amount
  - [ ] Status (completed/pending/failed)
  - [ ] Order ID

### 9.2 Functionality
- [ ] **Data Loading**
  - [ ] Transactions load on mount
  - [ ] Pull to refresh works
  - [ ] Pagination works
  - [ ] Loading state shown

- [ ] **Empty State**
  - [ ] Message shown when no transactions
  - [ ] Link to shop

---

## 10. Navigation Tests

### 10.1 Stack Navigation
- [ ] **Auth Stack**
  - [ ] Login to Register navigation
  - [ ] Register to Login navigation
  - [ ] Back button works

### 10.2 Tab Navigation
- [ ] **Main Tabs**
  - [ ] Home tab works
  - [ ] Game tab works
  - [ ] Shop tab works
  - [ ] Profile tab works
  - [ ] Tab icons display correctly
  - [ ] Active tab highlighted

### 10.3 Deep Linking
- [ ] **Payment Return**
  - [ ] Payment return URL handled
  - [ ] Redirect to correct screen

---

## 11. Error Handling Tests

### 11.1 Network Errors
- [ ] **Connection Issues**
  - [ ] No internet message shown
  - [ ] Retry button available
  - [ ] Offline mode works (game only)

### 11.2 API Errors
- [ ] **Error Responses**
  - [ ] 400 errors show validation messages
  - [ ] 401 errors trigger token refresh
  - [ ] 403 errors show permission denied
  - [ ] 404 errors show not found
  - [ ] 500 errors show server error

### 11.3 User Feedback
- [ ] **Error Messages**
  - [ ] Toast/alert shown for errors
  - [ ] Messages are user-friendly
  - [ ] Technical details hidden

---

## 12. Performance Tests

### 12.1 Loading Times
- [ ] **Screen Load**
  - [ ] Screens load within 2 seconds
  - [ ] Loading indicators shown
  - [ ] No blank screens

### 12.2 Animations
- [ ] **Smooth Transitions**
  - [ ] Navigation transitions smooth
  - [ ] Piece movements smooth (if animated)
  - [ ] No lag or stuttering

### 12.3 Memory Usage
- [ ] **Resource Management**
  - [ ] No memory leaks
  - [ ] App doesn't crash on long usage
  - [ ] Images load efficiently

---

## 13. Device-Specific Tests

### 13.1 Android Device
- [ ] **Build and Install**
  - [ ] APK builds successfully
  - [ ] App installs on device
  - [ ] App launches without crash

- [ ] **Functionality**
  - [ ] All screens work
  - [ ] Touch interactions work
  - [ ] Back button works
  - [ ] Keyboard works
  - [ ] WebView works (payment)

- [ ] **Permissions**
  - [ ] Internet permission granted
  - [ ] Storage permission (if needed)

### 13.2 iOS Device (If Applicable)
- [ ] **Build and Install**
  - [ ] IPA builds successfully
  - [ ] App installs on device
  - [ ] App launches without crash

- [ ] **Functionality**
  - [ ] All screens work
  - [ ] Touch interactions work
  - [ ] Keyboard works
  - [ ] WebView works (payment)

- [ ] **Permissions**
  - [ ] Internet permission granted
  - [ ] Storage permission (if needed)

---

## 14. Security Tests

### 14.1 Token Storage
- [ ] **Secure Storage**
  - [ ] Tokens stored in expo-secure-store
  - [ ] Tokens not visible in logs
  - [ ] Tokens cleared on logout

### 14.2 API Communication
- [ ] **HTTPS**
  - [ ] All API calls use HTTPS
  - [ ] No sensitive data in URLs
  - [ ] Headers include auth token

---

## 15. Accessibility Tests

### 15.1 Text Readability
- [ ] **Font Sizes**
  - [ ] Text readable on small screens
  - [ ] Contrast sufficient
  - [ ] No text cutoff

### 15.2 Touch Targets
- [ ] **Button Sizes**
  - [ ] Buttons large enough to tap
  - [ ] Adequate spacing between buttons
  - [ ] No accidental taps

---

## Test Summary

### Automated Tests
- **Game Engine Tests**: 29/29 passed ✅
- **Game Flow Tests**: All passed ✅

### Manual Tests
- **Authentication**: Pending
- **Home Screen**: Pending
- **Game Screen**: Pending
- **Shop Screen**: Pending
- **Profile Screen**: Pending
- **Leaderboard Screen**: Pending
- **History Screen**: Pending
- **Transactions Screen**: Pending
- **Navigation**: Pending
- **Error Handling**: Pending
- **Performance**: Pending
- **Android Device**: Pending
- **iOS Device**: Pending

---

## Notes

1. **Backend Dependency**: Most frontend tests require a running backend server. Ensure backend is running at the configured API_BASE_URL.

2. **Test Data**: Use test accounts and test payment methods (VNPay sandbox) for testing.

3. **Device Testing**: Physical device testing is recommended over emulator for accurate performance and touch interaction testing.

4. **Network Conditions**: Test under various network conditions (WiFi, 4G, slow connection, offline).

5. **Edge Cases**: Test with edge cases like very long usernames, high scores, many game sessions, etc.

---

## Test Execution Instructions

### Prerequisites
1. Backend server running and accessible
2. Database populated with test data
3. VNPay sandbox credentials configured
4. Android device or emulator ready
5. iOS device or simulator ready (if applicable)

### Running Tests

#### Automated Tests
```bash
# Game engine tests
node src/game/__tests__/manual-test.js

# Game flow tests
node src/game/__tests__/verify-game-flow.js
```

#### Manual Tests
1. Start the app: `npm start`
2. Run on Android: `npm run android`
3. Run on iOS: `npm run ios` (if applicable)
4. Follow the checklist above for each screen and feature

### Reporting Issues
- Document any failures with screenshots
- Include device information
- Note steps to reproduce
- Check console logs for errors

---

## Conclusion

This checklist provides comprehensive coverage of all frontend functionality. Complete all sections before marking Task 26 as complete.

**Status**: In Progress
**Last Updated**: December 20, 2024
