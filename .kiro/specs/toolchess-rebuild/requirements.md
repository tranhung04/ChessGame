# Requirements Document - ToolChess Rebuild

## Introduction

Dự án tái xây dựng hoàn toàn ứng dụng game Cờ Tướng ToolChess với kiến trúc mới, tách biệt rõ ràng giữa Frontend (React Native), Backend (NodeJS), và Database (SQL Server). Dự án tái sử dụng UI/UX từ phiên bản web gốc nhưng được tổ chức lại với code sạch, modular, và bảo mật cao.

## Glossary

- **System**: Hệ thống ToolChess bao gồm Mobile App, Backend API, và Database
- **Mobile_App**: Ứng dụng React Native Expo chạy trên Android/iOS
- **Backend_API**: Server NodeJS (Express/NestJS) xử lý business logic
- **Database**: SQL Server database lưu trữ dữ liệu
- **ChessBoard**: Component hiển thị bàn cờ 9x8
- **ChessGame**: Module game engine xử lý logic game
- **EnemyAI**: Module AI tự động chơi cho quân địch
- **JWT**: JSON Web Token dùng cho authentication
- **Refresh_Token**: Token dài hạn dùng để lấy access token mới
- **Access_Token**: Token ngắn hạn dùng để xác thực API requests
- **Premium_Package**: Gói dịch vụ trả phí với quyền lợi đặc biệt
- **VNPay**: Cổng thanh toán điện tử Việt Nam
- **Game_Session**: Một phiên chơi game từ lúc bắt đầu đến kết thúc
- **Leaderboard**: Bảng xếp hạng người chơi theo điểm số
- **SMTP**: Simple Mail Transfer Protocol để gửi email

## Requirements

### Requirement 1: Frontend Architecture

**User Story:** As a developer, I want a clean React Native frontend architecture, so that the codebase is maintainable and scalable.

#### Acceptance Criteria

1. THE Mobile_App SHALL use React Native with Expo framework
2. THE Mobile_App SHALL use @react-navigation for navigation management
3. THE Mobile_App SHALL use Context API for state management
4. THE Mobile_App SHALL use Axios with interceptors for API communication
5. THE Mobile_App SHALL use expo-secure-store for secure token storage
6. THE Mobile_App SHALL organize code into clear folders: services/, context/, navigation/, game/, screens/, components/
7. THE Mobile_App SHALL not hardcode API URLs and SHALL use environment configuration

### Requirement 2: Chess Board UI Port

**User Story:** As a player, I want the mobile chess board to look and feel like the web version, so that I have a familiar experience.

#### Acceptance Criteria

1. WHEN rendering the chess board, THE ChessBoard SHALL display a 9x8 grid matching the web version layout
2. WHEN a piece is selected, THE ChessBoard SHALL highlight valid moves using the same visual style as web version
3. WHEN a player taps a cell, THE ChessBoard SHALL handle piece selection and movement
4. THE ChessBoard SHALL use react-native-svg or View-based rendering for pieces and board
5. THE ChessBoard SHALL display Chinese chess symbols (車, 卒, 士, 象, 馬, 砲, 將) correctly
6. THE ChessBoard SHALL support touch interactions (tap to select, tap to move)
7. THE ChessBoard SHALL be organized into components: ChessBoard, ChessPiece, MoveHighlight, GameControls, GameInfo

### Requirement 3: Game Engine Module

**User Story:** As a developer, I want a pure game engine module, so that game logic is separated from UI and can be tested independently.

#### Acceptance Criteria

1. THE ChessGame SHALL be a pure JavaScript module with no UI dependencies
2. THE ChessGame SHALL manage board state (9x8 grid, pieces, positions)
3. THE ChessGame SHALL validate piece movements according to Chinese chess rules
4. THE ChessGame SHALL calculate valid moves for player Xe (unlimited straight lines)
5. THE ChessGame SHALL handle piece capture and score calculation
6. THE ChessGame SHALL support fire mode (blast adjacent enemies after capturing Tướng địch)
7. THE ChessGame SHALL apply premium bonus to scores when applicable
8. THE ChessGame SHALL expose clear input/output interfaces (getState, setState, makeMove, etc.)

### Requirement 4: Enemy AI Module

**User Story:** As a player, I want intelligent enemy AI, so that the game is challenging and fun.

#### Acceptance Criteria

1. THE EnemyAI SHALL be a separate module from ChessGame
2. THE EnemyAI SHALL analyze all enemy pieces and their valid moves
3. THE EnemyAI SHALL categorize moves into: attacking moves, safe moves, trap moves
4. THE EnemyAI SHALL prioritize attacking player Xe over other moves
5. THE EnemyAI SHALL avoid moves that put pieces in danger when possible
6. THE EnemyAI SHALL select moves using weighted randomization
7. THE EnemyAI SHALL execute moves through ChessGame interface

### Requirement 5: Authentication System

**User Story:** As a user, I want secure authentication, so that my account and data are protected.

#### Acceptance Criteria

1. WHEN registering, THE System SHALL validate username, email, and password
2. WHEN registering, THE System SHALL hash passwords using bcrypt with 12 rounds
3. WHEN logging in, THE System SHALL return both access token and refresh token
4. WHEN logging in, THE System SHALL store refresh token in Database by user and device/session
5. THE Access_Token SHALL expire after 15 minutes
6. THE Refresh_Token SHALL expire after 30 days
7. WHEN access token expires, THE Mobile_App SHALL automatically refresh using refresh token
8. WHEN refresh fails, THE Mobile_App SHALL logout user and redirect to login screen
9. THE System SHALL support logout which revokes refresh token in Database
10. THE System SHALL prevent refresh token spam using single-flight pattern

### Requirement 6: Backend API Structure

**User Story:** As a developer, I want a well-structured NodeJS backend, so that the API is maintainable and secure.

#### Acceptance Criteria

1. THE Backend_API SHALL use NodeJS with Express or NestJS framework
2. THE Backend_API SHALL connect to SQL Server database
3. THE Backend_API SHALL validate all input using zod, joi, or class-validator
4. THE Backend_API SHALL implement unified error handling
5. THE Backend_API SHALL implement basic logging
6. THE Backend_API SHALL use .env for configuration with .env.example provided
7. THE Backend_API SHALL implement CORS and helmet for security
8. THE Backend_API SHALL implement rate limiting for auth and payment endpoints
9. THE Backend_API SHALL provide Swagger documentation (optional but recommended)

### Requirement 7: Authentication Endpoints

**User Story:** As a mobile app, I want authentication endpoints, so that users can register, login, and manage sessions.

#### Acceptance Criteria

1. THE Backend_API SHALL provide POST /api/auth/register endpoint
2. THE Backend_API SHALL provide POST /api/auth/login endpoint
3. THE Backend_API SHALL provide POST /api/auth/logout endpoint
4. THE Backend_API SHALL provide POST /api/auth/refresh-token endpoint
5. WHEN registering, THE Backend_API SHALL validate email format and password strength
6. WHEN logging in, THE Backend_API SHALL verify credentials and return JWT tokens
7. WHEN refreshing token, THE Backend_API SHALL verify refresh token from Database
8. WHEN logging out, THE Backend_API SHALL revoke refresh token in Database

### Requirement 8: User Profile Management

**User Story:** As a user, I want to view and update my profile, so that I can manage my account information.

#### Acceptance Criteria

1. THE Backend_API SHALL provide GET /api/user/me endpoint
2. THE Backend_API SHALL provide PUT /api/user/me endpoint
3. WHEN getting profile, THE Backend_API SHALL return user info including premium status
4. WHEN updating profile, THE Backend_API SHALL validate and update allowed fields
5. THE Backend_API SHALL require valid JWT token for profile endpoints

### Requirement 9: Premium Package System

**User Story:** As a user, I want to purchase premium packages, so that I can get bonus features and score multipliers.

#### Acceptance Criteria

1. THE Backend_API SHALL provide GET /api/premium/packages endpoint
2. THE Backend_API SHALL provide POST /api/premium/subscribe endpoint
3. THE System SHALL support 4 premium packages: Basic (7 days, +10%, 2 revives), Standard (30 days, +20%, 5 revives), Pro (90 days, +30%, 10 revives), VIP (365 days, +50%, unlimited revives)
4. WHEN subscribing, THE Backend_API SHALL only activate premium after payment confirmation
5. THE Database SHALL store premium subscription with package, start date, end date, and benefits
6. THE Backend_API SHALL check premium expiration and return current status
7. THE ChessGame SHALL apply premium bonus to scores when user has active premium

### Requirement 10: VNPay Payment Integration

**User Story:** As a user, I want to pay via VNPay, so that I can purchase premium packages securely.

#### Acceptance Criteria

1. THE Backend_API SHALL provide POST /api/payment/vnpay/create endpoint
2. THE Backend_API SHALL provide GET /api/payment/vnpay/return endpoint for callback
3. THE Backend_API SHALL provide GET /api/payment/status/:orderId endpoint
4. WHEN creating payment, THE Backend_API SHALL generate VNPay payment URL with proper signature
5. WHEN receiving callback, THE Backend_API SHALL verify VNPay signature before processing
6. THE Backend_API SHALL not trust client-side payment data and SHALL verify server-side only
7. THE Mobile_App SHALL open payment URL in WebView
8. THE Mobile_App SHALL poll payment status after returning from WebView
9. THE Database SHALL store payment records with orderId, amount, status, vnpay transaction data, timestamps
10. WHEN payment succeeds, THE Backend_API SHALL activate premium subscription

### Requirement 11: Game Session Management

**User Story:** As a player, I want my game sessions tracked, so that my scores and history are saved.

#### Acceptance Criteria

1. THE Backend_API SHALL provide POST /api/game/start endpoint
2. THE Backend_API SHALL provide POST /api/game/submit endpoint
3. THE Backend_API SHALL provide GET /api/game/history endpoint
4. WHEN starting game, THE Backend_API SHALL create session record in Database
5. WHEN submitting game, THE Backend_API SHALL validate score bounds and logic
6. THE Database SHALL store game session with userId, mode, start/end time, score, premiumApplied, metadata
7. THE Backend_API SHALL implement basic anti-cheat validation (score bounds, time checks)
8. THE Backend_API SHALL optionally store move list or seed for verification

### Requirement 12: Leaderboard System

**User Story:** As a player, I want to see leaderboards, so that I can compare my scores with others.

#### Acceptance Criteria

1. THE Backend_API SHALL provide GET /api/game/leaderboard endpoint
2. WHEN getting leaderboard, THE Backend_API SHALL return top players sorted by highest score
3. THE Leaderboard SHALL display rank, username, highest score, premium badge
4. THE Backend_API SHALL support pagination for leaderboard
5. THE Database SHALL have indexes on score and createdAt for performance

### Requirement 13: Email Notification System

**User Story:** As a user, I want to receive emails for important events, so that I stay informed.

#### Acceptance Criteria

1. THE Backend_API SHALL use Gmail SMTP with App Password for sending emails
2. THE Backend_API SHALL configure SMTP settings via .env file
3. THE Backend_API SHALL send verification email on registration (optional)
4. THE Backend_API SHALL send password reset email when requested
5. THE Backend_API SHALL send payment confirmation email after successful purchase
6. THE Backend_API SHALL provide POST /api/email/send endpoint for testing (admin only)
7. THE Backend_API SHALL use nodemailer library for email sending

### Requirement 14: Database Schema

**User Story:** As a developer, I want a well-designed SQL Server schema, so that data is organized and performant.

#### Acceptance Criteria

1. THE Database SHALL have Users table with id, username, email, passwordHash, createdAt, updatedAt
2. THE Database SHALL have RefreshTokens table with id, userId, token, deviceInfo, expiresAt, createdAt
3. THE Database SHALL have PremiumPackages table with id, name, price, durationDays, scoreBonus, reviveCount, features
4. THE Database SHALL have UserPremiumSubscriptions table with id, userId, packageId, startDate, endDate, isActive
5. THE Database SHALL have Payments table with id, userId, orderId, packageId, amount, status, vnpayData, createdAt, updatedAt
6. THE Database SHALL have GameSessions table with id, userId, mode, startTime, endTime, score, premiumApplied, metadata
7. THE Database SHALL have GameMoves table (optional) with id, sessionId, moveNumber, fromPos, toPos, pieceType, captured
8. THE Database SHALL have proper indexes on userId, createdAt, orderId, score
9. THE Database SHALL have foreign key constraints for referential integrity

### Requirement 15: Database Migration Scripts

**User Story:** As a developer, I want migration scripts, so that I can set up the database easily.

#### Acceptance Criteria

1. THE System SHALL provide SQL scripts to create all tables
2. THE System SHALL provide SQL scripts to create indexes
3. THE System SHALL provide SQL scripts to seed premium packages data
4. THE System SHALL provide SQL scripts to create test users (for development)
5. THE SQL scripts SHALL be idempotent (can run multiple times safely)

### Requirement 16: Security Requirements

**User Story:** As a system administrator, I want strong security measures, so that the system is protected from attacks.

#### Acceptance Criteria

1. THE Backend_API SHALL hash all passwords using bcrypt with minimum 12 rounds
2. THE Backend_API SHALL use JWT with short-lived access tokens (15 minutes)
3. THE Backend_API SHALL use long-lived refresh tokens (30 days) stored in Database
4. THE Backend_API SHALL implement rate limiting on auth endpoints (max 5 requests per minute)
5. THE Backend_API SHALL implement rate limiting on payment endpoints (max 3 requests per minute)
6. THE Backend_API SHALL validate and sanitize all user input
7. THE Backend_API SHALL use CORS to restrict allowed origins
8. THE Backend_API SHALL use helmet middleware for security headers
9. THE Mobile_App SHALL store tokens in expo-secure-store (encrypted storage)
10. THE Backend_API SHALL verify VNPay signatures before processing payments

### Requirement 17: API Error Handling

**User Story:** As a developer, I want consistent error handling, so that errors are easy to debug and handle.

#### Acceptance Criteria

1. THE Backend_API SHALL return errors in consistent JSON format with code, message, details
2. THE Backend_API SHALL use appropriate HTTP status codes (400, 401, 403, 404, 500)
3. THE Backend_API SHALL log all errors with stack traces
4. THE Backend_API SHALL not expose sensitive information in error messages
5. THE Mobile_App SHALL handle API errors gracefully with user-friendly messages

### Requirement 18: Frontend API Integration

**User Story:** As a mobile app, I want robust API integration, so that network issues are handled gracefully.

#### Acceptance Criteria

1. THE Mobile_App SHALL use Axios instance with base URL from config
2. THE Mobile_App SHALL implement request interceptor to add JWT token to headers
3. THE Mobile_App SHALL implement response interceptor to handle 401 errors
4. WHEN receiving 401 error, THE Mobile_App SHALL attempt token refresh once
5. WHEN refresh succeeds, THE Mobile_App SHALL retry original request
6. WHEN refresh fails, THE Mobile_App SHALL logout user and clear tokens
7. THE Mobile_App SHALL implement single-flight pattern to prevent multiple refresh requests
8. THE Mobile_App SHALL handle network errors with retry logic or offline mode
9. THE Mobile_App SHALL show loading states during API calls
10. THE Mobile_App SHALL show error messages for failed API calls

### Requirement 19: Game Flow Integration

**User Story:** As a player, I want seamless game flow, so that I can play without interruptions.

#### Acceptance Criteria

1. WHEN starting game, THE Mobile_App SHALL call POST /api/game/start
2. WHEN game ends, THE Mobile_App SHALL call POST /api/game/submit with final score
3. THE Mobile_App SHALL handle offline mode gracefully (allow playing without backend)
4. THE Mobile_App SHALL sync game results when connection is restored
5. THE Mobile_App SHALL display premium bonus in UI when active
6. THE Mobile_App SHALL show game history from GET /api/game/history
7. THE Mobile_App SHALL show leaderboard from GET /api/game/leaderboard

### Requirement 20: Premium Shop UI

**User Story:** As a user, I want an attractive premium shop, so that I can easily purchase packages.

#### Acceptance Criteria

1. THE Mobile_App SHALL display all premium packages from GET /api/premium/packages
2. THE Mobile_App SHALL show package name, price, duration, score bonus, revive count
3. WHEN user taps "Buy", THE Mobile_App SHALL call POST /api/payment/vnpay/create
4. THE Mobile_App SHALL open payment URL in WebView
5. WHEN returning from payment, THE Mobile_App SHALL poll GET /api/payment/status/:orderId
6. WHEN payment succeeds, THE Mobile_App SHALL show success message and update premium status
7. WHEN payment fails, THE Mobile_App SHALL show error message

### Requirement 21: Code Quality Standards

**User Story:** As a developer, I want code quality standards, so that the codebase is maintainable.

#### Acceptance Criteria

1. THE System SHALL follow consistent naming conventions (camelCase for JS, PascalCase for components)
2. THE System SHALL have clear folder structure with separation of concerns
3. THE System SHALL have comments for complex logic
4. THE System SHALL have no hardcoded values (use constants/config)
5. THE System SHALL have proper error handling in all async functions
6. THE System SHALL have validation for all user inputs
7. THE System SHALL have logging for important operations

### Requirement 22: Testing Requirements

**User Story:** As a developer, I want test coverage, so that bugs are caught early.

#### Acceptance Criteria

1. THE System SHALL provide manual test checklist covering all features
2. THE Manual_Test_Checklist SHALL include: register, login, refresh token, play game, submit score, view history, view leaderboard, buy premium, payment success/fail, email send
3. THE ChessGame module SHALL have unit tests for core logic (optional but recommended)
4. THE Backend_API SHALL have integration tests for critical endpoints (optional but recommended)

### Requirement 23: Documentation Requirements

**User Story:** As a developer, I want comprehensive documentation, so that I can understand and maintain the system.

#### Acceptance Criteria

1. THE System SHALL provide README with setup instructions for backend
2. THE System SHALL provide README with setup instructions for frontend
3. THE System SHALL provide API documentation with endpoints, request/response examples
4. THE System SHALL provide database schema documentation
5. THE System SHALL provide VNPay integration flow documentation
6. THE System SHALL provide refresh token flow documentation
7. THE System SHALL provide .env.example files with all required variables

### Requirement 24: Deployment Preparation

**User Story:** As a developer, I want deployment-ready code, so that the system can be deployed easily.

#### Acceptance Criteria

1. THE Backend_API SHALL have production-ready configuration
2. THE Backend_API SHALL have environment-based config (dev/staging/prod)
3. THE Mobile_App SHALL have build configuration for Android APK
4. THE Mobile_App SHALL have build configuration for iOS (optional)
5. THE System SHALL have .gitignore to exclude sensitive files
6. THE System SHALL have .env.example but not .env in version control

### Requirement 25: Anti-Cheat Measures

**User Story:** As a system administrator, I want anti-cheat measures, so that leaderboards are fair.

#### Acceptance Criteria

1. THE Backend_API SHALL validate score bounds (minimum 0, maximum reasonable value)
2. THE Backend_API SHALL validate game duration (minimum time to achieve score)
3. THE Backend_API SHALL optionally store move list for verification
4. THE Backend_API SHALL optionally use seed-based validation
5. THE Backend_API SHALL flag suspicious sessions for review
6. THE Backend_API SHALL implement rate limiting on game submission (max 10 games per hour)
