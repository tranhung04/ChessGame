# Implementation Plan: ToolChess Rebuild

## Overview

This implementation plan covers the complete rebuild of the ToolChess mobile game application with a clean architecture separating Frontend (React Native), Backend (NodeJS), and Database (SQL Server). The plan is organized into phases that can be executed incrementally, with each phase building on the previous one.

## Tasks

- [ ] 1. Database Setup and Schema Creation
  - Create SQL Server database
  - Run schema creation scripts for all tables
  - Create indexes for performance
  - Seed premium packages data
  - Create test users for development
  - _Requirements: 14.1-14.9, 15.1-15.5_

- [x] 2. Backend Project Setup
  - [x] 2.1 Initialize NodeJS project with Express or NestJS
    - Set up project structure (routes/, controllers/, services/, repositories/)
    - Configure TypeScript (if using)
    - Set up .env configuration with .env.example
    - Install dependencies (express, mssql, bcrypt, jsonwebtoken, nodemailer, etc.)
    - _Requirements: 6.1, 6.2, 6.6_

  - [x] 2.2 Configure database connection
    - Set up SQL Server connection pool
    - Create database client wrapper
    - Test database connectivity
    - _Requirements: 6.2_

  - [x] 2.3 Set up middleware
    - CORS middleware
    - Helmet for security headers
    - Body parser
    - Request logging middleware
    - Error handling middleware
    - _Requirements: 6.7, 6.8, 17.1-17.5_

  - [ ]* 2.4 Write unit tests for middleware
    - Test CORS configuration
    - Test error handling middleware
    - _Requirements: 22.1-22.3_

- [-] 3. Authentication System Implementation
  - [x] 3.1 Implement password hashing service
    - Create bcrypt wrapper with 12 rounds
    - Add password validation (strength requirements)
    - _Requirements: 5.2, 16.1_

  - [ ]* 3.2 Write property test for password hashing
    - **Property 8: Password Hashing Security**
    - **Validates: Requirements 5.2, 16.1**

  - [x] 3.3 Implement JWT token service
    - Generate access tokens (15 min expiry)
    - Generate refresh tokens (30 day expiry)
    - Verify and decode tokens
    - _Requirements: 5.5, 5.6, 16.2, 16.3_

  - [x] 3.4 Create RefreshToken repository
    - Store refresh token in database
    - Retrieve refresh token by token string
    - Revoke refresh token
    - Clean up expired tokens
    - _Requirements: 5.4, 5.9_

  - [x] 3.5 Implement authentication endpoints
    - POST /api/auth/register
    - POST /api/auth/login
    - POST /api/auth/refresh-token
    - POST /api/auth/logout
    - _Requirements: 7.1-7.8_

  - [ ]* 3.6 Write property test for input validation
    - **Property 7: Input Validation Rejection**
    - **Validates: Requirements 5.1**

  - [ ]* 3.7 Write property test for token refresh idempotency
    - **Property 9: Token Refresh Idempotency**
    - **Validates: Requirements 5.10**

  - [x] 3.8 Implement rate limiting for auth endpoints
    - Max 5 requests per minute for login/register
    - Max 10 requests per minute for refresh
    - _Requirements: 16.4_

  - [ ]* 3.9 Write unit tests for authentication endpoints
    - Test successful registration
    - Test duplicate email rejection
    - Test successful login
    - Test invalid credentials
    - Test token refresh
    - Test logout
    - _Requirements: 22.1-22.3_

- [x] 4. Checkpoint - Test Authentication System
  - Ensure all authentication tests pass
  - Manually test registration, login, refresh, logout flows
  - Ask the user if questions arise

- [x] 5. User Profile Management
  - [x] 5.1 Create User repository
    - Get user by ID
    - Get user by email
    - Update user profile
    - Get user statistics
    - _Requirements: 8.1-8.5_

  - [x] 5.2 Implement user profile endpoints
    - GET /api/user/me
    - PUT /api/user/me
    - _Requirements: 8.1-8.5_

  - [ ]* 5.3 Write unit tests for profile endpoints
    - Test get profile
    - Test update profile
    - Test authorization
    - _Requirements: 22.1-22.3_

- [x] 6. Premium Package System
  - [x] 6.1 Create PremiumPackage repository
    - Get all packages
    - Get package by ID
    - Check if package is active
    - _Requirements: 9.1-9.3_

  - [x] 6.2 Create UserPremiumSubscription repository
    - Create subscription
    - Get active subscription by user
    - Check if subscription is expired
    - Update revives used
    - _Requirements: 9.4-9.7_

  - [x] 6.3 Implement premium service
    - Calculate premium bonus
    - Check premium status
    - Activate premium subscription
    - _Requirements: 9.4-9.7_

  - [ ]* 6.4 Write property test for premium bonus calculation
    - **Property 10: Premium Bonus Application**
    - **Validates: Requirements 9.7**

  - [x] 6.5 Implement premium endpoints
    - GET /api/premium/packages
    - POST /api/premium/subscribe
    - _Requirements: 9.1-9.3_

  - [ ]* 6.6 Write unit tests for premium endpoints
    - Test get packages
    - Test subscribe with valid payment
    - Test subscribe without payment
    - _Requirements: 22.1-22.3_

- [x] 7. VNPay Payment Integration
  - [x] 7.1 Implement VNPay signature service
    - Generate payment URL with signature
    - Verify callback signature
    - _Requirements: 10.4, 10.5, 16.10_

  - [ ]* 7.2 Write property test for signature verification
    - **Property 11: VNPay Signature Verification**
    - **Validates: Requirements 10.6, 16.10**

  - [x] 7.3 Create Payment repository
    - Create payment record
    - Update payment status
    - Get payment by order ID
    - Get user payment history
    - _Requirements: 10.9_

  - [x] 7.4 Implement payment endpoints
    - POST /api/payment/vnpay/create
    - GET /api/payment/vnpay/return (callback)
    - GET /api/payment/status/:orderId
    - _Requirements: 10.1-10.3_

  - [x] 7.5 Implement payment callback handler
    - Verify VNPay signature
    - Update payment status
    - Activate premium subscription on success
    - Send confirmation email
    - _Requirements: 10.5, 10.6, 10.10_

  - [ ]* 7.6 Write integration tests for payment flow
    - Test payment creation
    - Test callback with valid signature
    - Test callback with invalid signature
    - Test payment status polling
    - _Requirements: 22.1-22.3_

- [x] 8. Checkpoint - Test Premium and Payment
  - Ensure all premium and payment tests pass
  - Manually test payment flow with VNPay sandbox
  - Verify premium activation after payment
  - Ask the user if questions arise

- [x] 9. Email Service Implementation
  - [x] 9.1 Configure Gmail SMTP
    - Set up nodemailer with Gmail
    - Configure SMTP settings from .env
    - Create email templates (verification, password reset, payment confirmation)
    - _Requirements: 13.1, 13.2_

  - [x] 9.2 Implement email service
    - Send verification email
    - Send password reset email
    - Send payment confirmation email
    - _Requirements: 13.3-13.6_

  - [x] 9.3 Implement email endpoint (admin/testing)
    - POST /api/email/send
    - _Requirements: 13.6_

  - [ ]* 9.4 Write unit tests for email service
    - Test email sending (with mock SMTP)
    - Test email template rendering
    - Test error handling
    - _Requirements: 22.1-22.3_

- [x] 10. Game Session Management
  - [x] 10.1 Create GameSession repository
    - Create game session
    - Update game session
    - Get session by ID
    - Get user game history
    - Get leaderboard
    - _Requirements: 11.1-11.8_

  - [x] 10.2 Create GameMove repository (optional for anti-cheat)
    - Store move data
    - Get moves by session
    - _Requirements: 11.8_

  - [x] 10.3 Implement game service
    - Start game session
    - Validate game submission
    - Calculate final score with premium bonus
    - Detect suspicious scores
    - _Requirements: 11.5, 11.6, 11.7, 25.1-25.6_

  - [ ]* 10.4 Write property test for score validation
    - **Property 12: Score Bounds Validation**
    - **Validates: Requirements 11.6, 25.1**

  - [x] 10.5 Implement game endpoints
    - POST /api/game/start
    - POST /api/game/submit
    - GET /api/game/history
    - _Requirements: 11.1-11.3_

  - [x] 10.6 Implement rate limiting for game submission
    - Max 10 games per hour per user
    - _Requirements: 25.6_

  - [ ]* 10.7 Write unit tests for game endpoints
    - Test game start
    - Test game submit with valid score
    - Test game submit with invalid score
    - Test game history pagination
    - _Requirements: 22.1-22.3_

- [x] 11. Leaderboard System
  - [x] 11.1 Implement leaderboard service
    - Query top players by score
    - Support pagination
    - Include premium badges
    - Cache results (5 min TTL)
    - _Requirements: 12.1-12.5_

  - [ ]* 11.2 Write property test for leaderboard sorting
    - **Property 13: Leaderboard Sorting**
    - **Validates: Requirements 12.2**

  - [x] 11.3 Implement leaderboard endpoint
    - GET /api/game/leaderboard
    - _Requirements: 12.1_

  - [ ]* 11.4 Write unit tests for leaderboard
    - Test leaderboard sorting
    - Test pagination
    - Test premium badge display
    - _Requirements: 22.1-22.3_

- [x] 12. Checkpoint - Test Backend Completely
  - Run all backend unit tests
  - Run all backend integration tests
  - Test all endpoints with Postman/Insomnia
  - Verify database data integrity
  - Ask the user if questions arise


- [x] 13. Frontend Project Setup
  - [x] 13.1 Initialize React Native Expo project
    - Set up project structure (src/screens, src/components, src/services, src/game, src/context, src/navigation)
    - Install dependencies (@react-navigation, axios, expo-secure-store, react-native-svg)
    - Configure app.json with app name, icons, splash screen
    - _Requirements: 1.1-1.7_

  - [x] 13.2 Set up environment configuration
    - Create config/constants.js with API_BASE_URL
    - Support dev/staging/prod environments
    - No hardcoded URLs
    - _Requirements: 1.7_

  - [ ]* 13.3 Write test to verify no hardcoded URLs
    - **Validates: Requirements 1.7**

  - [x] 13.4 Set up navigation structure
    - Create AppNavigator with Auth Stack and Main Tabs
    - Configure Auth Stack (Login, Register)
    - Configure Main Tabs (Home, Game, Shop, Profile)
    - Add Leaderboard screen
    - _Requirements: 1.2_

- [x] 14. Authentication Context and API Integration
  - [x] 14.1 Create AuthContext
    - Manage authentication state (user, tokens, loading)
    - Provide login, register, logout, refresh functions
    - Store tokens in expo-secure-store
    - _Requirements: 1.3, 1.5, 18.1-18.10_

  - [x] 14.2 Set up Axios instance with interceptors
    - Create API client with base URL
    - Add request interceptor to inject JWT token
    - Add response interceptor to handle 401 errors
    - Implement single-flight refresh pattern
    - _Requirements: 1.4, 18.2-18.7_

  - [ ]* 14.3 Write property test for single-flight refresh
    - Test concurrent refresh requests
    - **Validates: Requirements 18.4-18.6**

  - [x] 14.4 Create API service modules
    - authAPI (register, login, logout, refresh)
    - userAPI (getMe, updateMe)
    - premiumAPI (getPackages, subscribe)
    - paymentAPI (createPayment, getPaymentStatus)
    - gameAPI (startGame, submitGame, getHistory, getLeaderboard)
    - _Requirements: 18.1_

  - [ ]* 14.5 Write unit tests for API services
    - Test API calls with mocked axios
    - Test error handling
    - _Requirements: 22.1-22.3_

- [x] 15. Authentication Screens
  - [x] 15.1 Create LoginScreen
    - Email and password inputs
    - Login button
    - Link to RegisterScreen
    - Handle login errors
    - Show loading state
    - _Requirements: 5.3, 18.9, 18.10_

  - [x] 15.2 Create RegisterScreen
    - Username, email, password, confirm password inputs
    - Register button
    - Validate password match
    - Handle registration errors
    - Show loading state
    - _Requirements: 5.1, 5.2_

  - [ ]* 15.3 Write integration tests for auth screens
    - Test successful login
    - Test failed login
    - Test successful registration
    - Test validation errors
    - _Requirements: 22.1-22.3_

- [x] 16. Game Engine Module (Port from Web)
  - [x] 16.1 Create ChessGame class
    - Initialize 9x8 board
    - Manage game state (board, pieces, score, turn, mode)
    - Place and remove pieces
    - Calculate valid moves for player Xe
    - Handle player moves
    - Calculate scores with premium bonus
    - Support fire mode
    - _Requirements: 3.1-3.8_

  - [ ]* 16.2 Write property test for board state consistency
    - **Property 1: Board State Consistency**
    - **Validates: Requirements 3.2**

  - [ ]* 16.3 Write property test for move validation
    - **Property 2: Move Validation Correctness**
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 16.4 Write property test for score calculation
    - **Property 3: Score Calculation with Premium Bonus**
    - **Validates: Requirements 3.5, 3.7, 9.7**

  - [ ]* 16.5 Write property test for fire mode
    - **Property 4: Fire Mode Activation and Blast**
    - **Validates: Requirements 3.6**

  - [x] 16.6 Create game constants
    - Piece types
    - Piece values
    - Board configuration
    - _Requirements: 3.1_

  - [ ]* 16.7 Write unit tests for ChessGame
    - Test board initialization
    - Test piece placement
    - Test move execution
    - Test score calculation
    - Test fire mode
    - _Requirements: 22.1-22.3_

- [x] 17. Enemy AI Module (Port from Web)
  - [x] 17.1 Create EnemyAI class
    - Analyze all enemy pieces
    - Categorize moves (attacking, safe, trap)
    - Select best move with prioritization
    - Execute AI turn
    - _Requirements: 4.1-4.7_

  - [ ]* 17.2 Write property test for move categorization
    - **Property 5: AI Move Categorization**
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 17.3 Write property test for attack prioritization
    - **Property 6: AI Attack Prioritization**
    - **Validates: Requirements 4.4**

  - [ ]* 17.4 Write unit tests for EnemyAI
    - Test move categorization
    - Test move selection
    - Test AI turn execution
    - _Requirements: 22.1-22.3_

- [x] 18. Checkpoint - Test Game Engine
  - Run all game engine tests
  - Manually test game logic in isolation
  - Verify all chess rules work correctly
  - Ask the user if questions arise

- [x] 19. Chess Board UI Components (Port from Web)
  - [x] 19.1 Create ChessBoard component
    - Render 9x8 grid using View or SVG
    - Display pieces at correct positions
    - Handle cell press events
    - Highlight selected piece
    - Highlight valid moves
    - Match web version styling
    - _Requirements: 2.1-2.3, 2.7_

  - [ ]* 19.2 Write property test for board grid rendering
    - **Property 17: Board Grid Rendering**
    - **Validates: Requirements 2.1**

  - [x] 19.3 Create ChessPiece component
    - Display Chinese chess symbols
    - Apply colors (player vs enemy)
    - Show selection highlight
    - Support animations (optional)
    - _Requirements: 2.5_

  - [ ]* 19.4 Write property test for piece symbol mapping
    - **Property 16: Chess Piece Symbol Mapping**
    - **Validates: Requirements 2.5**

  - [x] 19.5 Create MoveHighlight component
    - Overlay highlights on cells
    - Different styles for valid/attack/selected
    - Match web version styling
    - _Requirements: 2.2_

  - [x] 19.6 Create GameControls component
    - Start game button
    - Reset game button
    - Use revive button
    - Show revive count
    - Enable/disable based on game state
    - _Requirements: 2.7_

  - [x] 19.7 Create GameInfo component
    - Display current score
    - Show premium bonus indicator
    - Display turn count
    - Show fire mode status
    - _Requirements: 2.7_

  - [ ]* 19.8 Write component tests
    - Test ChessBoard rendering
    - Test ChessPiece rendering
    - Test touch interactions
    - _Requirements: 22.1-22.3_

- [-] 20. Game Screen Integration
  - [x] 20.1 Create GameScreen
    - Integrate ChessBoard, GameControls, GameInfo
    - Manage game state using ChessGame instance
    - Handle setup phase (place Xe and enemies)
    - Handle playing phase (player moves, AI moves)
    - Handle game end (submit score)
    - Call gameAPI.startGame on start
    - Call gameAPI.submitGame on end
    - Apply premium bonus from user context
    - _Requirements: 19.1-19.7_

  - [x] 20.2 Implement game flow logic
    - Setup phase: tap to place Xe, spawn enemies
    - Playing phase: tap to select, tap to move
    - Enemy turn: AI selects and executes move
    - Fire mode: blast adjacent enemies
    - Game end: player Xe captured or no moves
    - _Requirements: 19.1-19.7_

  - [ ]* 20.3 Write integration tests for GameScreen
    - Test complete game flow
    - Test API integration
    - Test premium bonus application
    - _Requirements: 22.1-22.3_

- [x] 21. Home Screen
  - [x] 21.1 Create HomeScreen
    - Display user statistics (total games, highest score)
    - Show premium status badge
    - "Play Now" button → navigate to GameScreen
    - "Leaderboard" button → navigate to LeaderboardScreen
    - "Shop" button → navigate to ShopScreen
    - _Requirements: 19.1_

  - [ ]* 21.2 Write component tests for HomeScreen
    - Test navigation
    - Test data display
    - _Requirements: 22.1-22.3_

- [x] 22. Premium Shop Screen
  - [x] 22.1 Create ShopScreen
    - Fetch and display premium packages
    - Show package details (name, price, features)
    - "Buy Now" button for each package
    - Handle purchase flow
    - _Requirements: 20.1-20.7_

  - [x] 22.2 Implement payment flow
    - Call paymentAPI.createPayment
    - Open payment URL in WebView
    - Poll paymentAPI.getPaymentStatus after return
    - Show success/failure message
    - Update premium status on success
    - _Requirements: 20.3-20.7_

  - [ ]* 22.3 Write integration tests for ShopScreen
    - Test package display
    - Test payment flow
    - Test WebView integration
    - _Requirements: 22.1-22.3_

- [-] 23. Profile Screen
  - [x] 23.1 Create ProfileScreen
    - Display user info (username, email)
    - Show game statistics
    - Show premium info (if active)
    - "Logout" button
    - "Game History" button
    - "Transaction History" button
    - _Requirements: 19.1_

  - [x] 23.2 Implement profile actions
    - Logout: call authAPI.logout, clear tokens, navigate to login
    - View game history: navigate to HistoryScreen
    - View transactions: navigate to TransactionsScreen
    - _Requirements: 19.1_

  - [ ]* 23.3 Write component tests for ProfileScreen
    - Test data display
    - Test logout
    - Test navigation
    - _Requirements: 22.1-22.3_

- [x] 24. Leaderboard Screen
  - [x] 24.1 Create LeaderboardScreen
    - Fetch and display leaderboard
    - Show rank, username, score, premium badge
    - Highlight current user
    - Support pagination
    - Pull to refresh
    - _Requirements: 19.7_

  - [ ]* 24.2 Write component tests for LeaderboardScreen
    - Test data display
    - Test pagination
    - Test refresh
    - _Requirements: 22.1-22.3_

- [x] 25. Game History Screen
  - [x] 25.1 Create HistoryScreen
    - Fetch and display game history
    - Show session details (score, date, duration)
    - Support pagination
    - Pull to refresh
    - _Requirements: 19.6_

  - [ ]* 25.2 Write component tests for HistoryScreen
    - Test data display
    - Test pagination
    - _Requirements: 22.1-22.3_

- [x] 26. Checkpoint - Test Frontend Completely
  - Run all frontend unit tests
  - Run all frontend integration tests
  - Manually test all screens and flows
  - Test on real Android device
  - Test on real iOS device (if applicable)
  - Ask the user if questions arise

- [x] 27. End-to-End Integration Testing
  - [x] 27.1 Test complete user journey
    - Register → Login → Play Game → Submit Score → View Leaderboard
    - _Requirements: 22.1-22.3_

  - [x] 27.2 Test premium purchase flow
    - Login → Shop → Buy Premium → Payment → Verify Premium Active
    - _Requirements: 22.1-22.3_

  - [x] 27.3 Test offline mode
    - Play game without network
    - Verify game works offline
    - Verify sync when network restored
    - _Requirements: 19.3, 19.4_

  - [x] 27.4 Test error scenarios
    - Network failures
    - Invalid inputs
    - Token expiration
    - Payment failures
    - _Requirements: 18.8-18.10_

- [ ] 28. Documentation
  - [ ] 28.1 Write API documentation
    - Document all endpoints
    - Include request/response examples
    - Document error codes
    - Create Swagger/OpenAPI spec (optional)
    - _Requirements: 23.3_

  - [ ] 28.2 Write backend README
    - Setup instructions
    - Environment variables
    - Database setup
    - Running locally
    - Deployment guide
    - _Requirements: 23.1_

  - [ ] 28.3 Write frontend README
    - Setup instructions
    - Environment configuration
    - Running on device
    - Building APK/IPA
    - _Requirements: 23.2_

  - [ ] 28.4 Write database documentation
    - Schema diagram
    - Table descriptions
    - Migration guide
    - _Requirements: 23.4_

  - [ ] 28.5 Write integration flow documentation
    - VNPay payment flow
    - Refresh token flow
    - Game session flow
    - _Requirements: 23.5, 23.6_

- [-] 29. Security Hardening
  - [x] 29.1 Review and fix security issues
    - Check for hardcoded secrets
    - Review CORS configuration
    - Verify rate limiting
    - Test authentication bypass attempts
    - Test SQL injection prevention
    - _Requirements: 16.1-16.10_

  - [ ]* 29.2 Write property test for rate limiting
    - **Property 18: Rate Limiting Enforcement**
    - **Validates: Requirements 16.4, 16.5**

  - [ ]* 29.3 Write property test for error response format
    - **Property 15: Error Response Format Consistency**
    - **Validates: Requirements 17.1, 17.2**

- [x] 30. Performance Optimization
  - [x] 30.1 Optimize backend performance
    - Add database indexes
    - Implement caching
    - Optimize queries
    - Profile and fix slow endpoints
    - _Requirements: Performance section_

  - [x] 30.2 Optimize frontend performance
    - Optimize re-renders
    - Implement virtualization for lists
    - Optimize images
    - Minimize bundle size
    - _Requirements: Performance section_

- [-] 31. Final Testing and Deployment Preparation
  - [x] 31.1 Run complete manual test checklist
    - Follow checklist in Requirements 22.2
    - Test all features
    - Test on multiple devices
    - Test with real VNPay sandbox
    - Test email delivery
    - _Requirements: 22.1-22.3_

  - [x] 31.2 Prepare for deployment
    - Set up production environment variables
    - Configure production database
    - Set up monitoring and logging
    - Create deployment scripts
    - _Requirements: 24.1-24.6_

  - [x] 31.3 Build production APK
    - Configure release build
    - Sign APK
    - Test release build
    - _Requirements: 24.3_

- [ ] 32. Final Checkpoint - Production Ready
  - All tests passing
  - All documentation complete
  - Security review complete
  - Performance acceptable
  - Ready for deployment
  - Ask the user for final approval

## Notes

- Tasks marked with `*` are optional test tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- The implementation follows a bottom-up approach: Database → Backend → Frontend
- Backend is completed and tested before starting frontend work
- Game engine is developed and tested independently before UI integration
