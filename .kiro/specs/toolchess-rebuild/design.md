# Design Document - ToolChess Rebuild

## Overview

Dự án ToolChess Rebuild là một hệ thống full-stack hoàn chỉnh bao gồm:
- **Frontend**: React Native (Expo) mobile app cho Android/iOS
- **Backend**: NodeJS (Express/NestJS) REST API server
- **Database**: SQL Server với schema được thiết kế tối ưu
- **Integration**: VNPay payment gateway, Gmail SMTP email service

Hệ thống được thiết kế với kiến trúc 3-tier rõ ràng, tách biệt hoàn toàn presentation layer, business logic layer, và data layer.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │  Components  │  │   Context    │      │
│  │ (Auth/Game/  │  │ (ChessBoard/ │  │ (AuthContext)│      │
│  │  Shop/etc)   │  │  ChessPiece) │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Navigation (React Navigation)          │       │
│  └──────────────────────────────────────────────────┘       │
│         │                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │      Services Layer (API Client + Axios)         │       │
│  │  - Request Interceptor (Add JWT)                 │       │
│  │  - Response Interceptor (Handle 401/Refresh)     │       │
│  └──────────────────────────────────────────────────┘       │
│         │                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │    Game Engine (Pure Logic - No UI Dependency)   │       │
│  │  - ChessGame.js (Board State, Rules, Scoring)    │       │
│  │  - EnemyAI.js (AI Decision Making)               │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Backend API Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Controllers  │  │  Middleware  │      │
│  │ (Express/    │  │ (Business    │  │ (Auth/Rate   │      │
│  │  NestJS)     │  │   Logic)     │  │  Limit/CORS) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Services Layer                      │       │
│  │  - AuthService (JWT, Bcrypt)                     │       │
│  │  - GameService (Session, Validation)             │       │
│  │  - PaymentService (VNPay Integration)            │       │
│  │  - EmailService (Gmail SMTP)                     │       │
│  └──────────────────────────────────────────────────┘       │
│         │                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Data Access Layer (DAL)                │       │
│  │  - User Repository                               │       │
│  │  - Game Repository                               │       │
│  │  - Payment Repository                            │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                      SQL Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                   SQL Server Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │RefreshTokens │  │   Payments   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │GameSessions  │  │Premium       │  │ GameMoves    │      │
│  │              │  │Subscriptions │  │  (Optional)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### External Integrations

```
Backend API
    │
    ├──> VNPay Gateway (Payment Processing)
    │    - Create payment URL
    │    - Verify callback signature
    │    - Process payment result
    │
    └──> Gmail SMTP (Email Service)
         - Send verification emails
         - Send password reset
         - Send payment confirmations
```

## Components and Interfaces

### Frontend Components

#### 1. ChessBoard Component

**Props:**
```typescript
interface ChessBoardProps {
  gameState: GameState;
  onCellPress: (row: number, col: number) => void;
  validMoves: Position[];
  selectedPiece: Position | null;
  highlightedCells: Position[];
}
```

**Responsibilities:**
- Render 9x8 grid using react-native-svg or View components
- Display pieces at correct positions
- Highlight selected piece and valid moves
- Handle touch events and delegate to parent
- Apply visual styles matching web version

**State:**
- No internal state (controlled component)
- All state managed by parent GameScreen

#### 2. ChessPiece Component

**Props:**
```typescript
interface ChessPieceProps {
  type: PieceType;
  isEnemy: boolean;
  position: Position;
  isSelected: boolean;
}
```

**Responsibilities:**
- Render Chinese chess symbol (車, 卒, 士, 象, 馬, 砲, 將)
- Apply color based on isEnemy flag
- Show selection highlight
- Support animations (optional)

#### 3. MoveHighlight Component

**Props:**
```typescript
interface MoveHighlightProps {
  positions: Position[];
  type: 'valid' | 'attack' | 'selected';
}
```

**Responsibilities:**
- Overlay highlight on specified cells
- Different visual styles for different highlight types
- Match web version styling

#### 4. GameControls Component

**Props:**
```typescript
interface GameControlsProps {
  onStartGame: () => void;
  onResetGame: () => void;
  onUseRevive: () => void;
  gameMode: GameMode;
  revivesLeft: number;
}
```

**Responsibilities:**
- Display game control buttons
- Show revive count
- Enable/disable buttons based on game state

#### 5. GameInfo Component

**Props:**
```typescript
interface GameInfoProps {
  score: number;
  turnCount: number;
  fireModeActive: boolean;
  premiumBonus: number;
}
```

**Responsibilities:**
- Display current score with premium bonus indicator
- Show turn count
- Show fire mode status
- Display game statistics

### Backend API Endpoints

#### Authentication Endpoints

**POST /api/auth/register**
```json
Request:
{
  "username": "player123",
  "email": "player@example.com",
  "password": "SecurePass123!"
}

Response (201):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "player123",
      "email": "player@example.com"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}

Error (400):
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { "field": "email" }
  }
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "player@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "player123",
      "email": "player@example.com",
      "premium": {
        "isActive": true,
        "package": "Pro",
        "expiresAt": "2024-12-31T23:59:59Z"
      }
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

**POST /api/auth/refresh-token**
```json
Request:
{
  "refreshToken": "refresh_token"
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}

Error (401):
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired"
  }
}
```

**POST /api/auth/logout**
```json
Request:
{
  "refreshToken": "refresh_token"
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### User Profile Endpoints

**GET /api/user/me**
```json
Headers:
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "player123",
    "email": "player@example.com",
    "stats": {
      "totalGames": 150,
      "highestScore": 2500,
      "averageScore": 1200
    },
    "premium": {
      "isActive": true,
      "package": "Pro",
      "scoreBonus": 0.3,
      "revivesLeft": 10,
      "expiresAt": "2024-12-31T23:59:59Z"
    }
  }
}
```

**PUT /api/user/me**
```json
Headers:
Authorization: Bearer {accessToken}

Request:
{
  "username": "newUsername",
  "email": "newemail@example.com"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "newUsername",
    "email": "newemail@example.com"
  }
}
```

#### Premium Package Endpoints

**GET /api/premium/packages**
```json
Response (200):
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "basic",
        "name": "Basic",
        "price": 29000,
        "currency": "VND",
        "durationDays": 7,
        "scoreBonus": 0.1,
        "reviveCount": 2,
        "features": [
          "+10% điểm cho mọi quân cờ",
          "2 lượt hồi sinh miễn phí",
          "Giao diện đặc biệt"
        ]
      },
      {
        "id": "standard",
        "name": "Standard",
        "price": 79000,
        "currency": "VND",
        "durationDays": 30,
        "scoreBonus": 0.2,
        "reviveCount": 5,
        "features": [
          "+20% điểm cho mọi quân cờ",
          "5 lượt hồi sinh miễn phí",
          "Giao diện đặc biệt",
          "Hỗ trợ ưu tiên"
        ]
      }
    ]
  }
}
```

**POST /api/premium/subscribe**
```json
Headers:
Authorization: Bearer {accessToken}

Request:
{
  "packageId": "pro",
  "paymentId": "payment_uuid"
}

Response (200):
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_uuid",
      "packageId": "pro",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-04-01T00:00:00Z",
      "isActive": true
    }
  }
}
```


#### Payment Endpoints

**POST /api/payment/vnpay/create**
```json
Headers:
Authorization: Bearer {accessToken}

Request:
{
  "packageId": "pro",
  "returnUrl": "toolchess://payment-return"
}

Response (200):
{
  "success": true,
  "data": {
    "orderId": "order_uuid",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "amount": 199000,
    "expiresAt": "2024-01-01T01:00:00Z"
  }
}
```

**GET /api/payment/vnpay/return**
```
Query Parameters:
- vnp_Amount
- vnp_BankCode
- vnp_OrderInfo
- vnp_ResponseCode
- vnp_SecureHash
- ... (other VNPay params)

Response (Redirect):
- Success: Redirect to success page
- Failure: Redirect to failure page

Side Effect:
- Verify VNPay signature
- Update payment status in database
- Activate premium subscription if successful
- Send confirmation email
```

**GET /api/payment/status/:orderId**
```json
Headers:
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "orderId": "order_uuid",
    "status": "completed", // pending | completed | failed | expired
    "amount": 199000,
    "packageId": "pro",
    "createdAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:05:00Z"
  }
}
```

#### Game Session Endpoints

**POST /api/game/start**
```json
Headers:
Authorization: Bearer {accessToken}

Request:
{
  "mode": "normal" // or "premium"
}

Response (200):
{
  "success": true,
  "data": {
    "session": {
      "id": "session_uuid",
      "userId": "user_uuid",
      "mode": "normal",
      "startTime": "2024-01-01T10:00:00Z",
      "premiumApplied": true,
      "scoreBonus": 0.3
    }
  }
}
```

**POST /api/game/submit**
```json
Headers:
Authorization: Bearer {accessToken}

Request:
{
  "sessionId": "session_uuid",
  "score": 2500,
  "turnCount": 45,
  "duration": 600, // seconds
  "moves": [ // optional for anti-cheat
    {"from": [0,0], "to": [0,1], "captured": null},
    {"from": [0,1], "to": [1,1], "captured": "tot"}
  ]
}

Response (200):
{
  "success": true,
  "data": {
    "session": {
      "id": "session_uuid",
      "score": 2500,
      "finalScore": 3250, // with premium bonus
      "rank": 15,
      "isNewHighScore": true
    }
  }
}

Error (400):
{
  "success": false,
  "error": {
    "code": "INVALID_SCORE",
    "message": "Score exceeds maximum possible value",
    "details": {
      "submittedScore": 2500,
      "maxPossibleScore": 2000
    }
  }
}
```

**GET /api/game/history**
```json
Headers:
Authorization: Bearer {accessToken}

Query Parameters:
- page: 1
- limit: 10

Response (200):
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_uuid",
        "mode": "normal",
        "score": 2500,
        "turnCount": 45,
        "duration": 600,
        "premiumApplied": true,
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

**GET /api/game/leaderboard**
```json
Query Parameters:
- limit: 100 (default)
- period: all | daily | weekly | monthly

Response (200):
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user_uuid",
        "username": "TopPlayer",
        "highestScore": 5000,
        "totalGames": 500,
        "isPremium": true,
        "premiumPackage": "VIP"
      }
    ],
    "currentUser": {
      "rank": 15,
      "highestScore": 3250
    }
  }
}
```

#### Email Endpoints

**POST /api/email/send** (Admin/Testing Only)
```json
Headers:
Authorization: Bearer {adminToken}

Request:
{
  "to": "user@example.com",
  "subject": "Test Email",
  "template": "verification",
  "data": {
    "username": "player123",
    "verificationLink": "https://..."
  }
}

Response (200):
{
  "success": true,
  "message": "Email sent successfully"
}
```

## Data Models

### Database Schema

#### Users Table
```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    IsEmailVerified BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Username (Username)
);
```

#### RefreshTokens Table
```sql
CREATE TABLE RefreshTokens (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Token NVARCHAR(500) NOT NULL UNIQUE,
    DeviceInfo NVARCHAR(500),
    IpAddress NVARCHAR(50),
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    RevokedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX IX_RefreshTokens_UserId (UserId),
    INDEX IX_RefreshTokens_Token (Token),
    INDEX IX_RefreshTokens_ExpiresAt (ExpiresAt)
);
```

#### PremiumPackages Table
```sql
CREATE TABLE PremiumPackages (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'VND',
    DurationDays INT NOT NULL,
    ScoreBonus DECIMAL(3,2) NOT NULL, -- 0.10 for 10%
    ReviveCount INT NOT NULL,
    Features NVARCHAR(MAX), -- JSON array
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

#### UserPremiumSubscriptions Table
```sql
CREATE TABLE UserPremiumSubscriptions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PackageId NVARCHAR(50) NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    IsActive BIT DEFAULT 1,
    RevivesUsed INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (PackageId) REFERENCES PremiumPackages(Id),
    INDEX IX_UserPremiumSubscriptions_UserId (UserId),
    INDEX IX_UserPremiumSubscriptions_EndDate (EndDate)
);
```

#### Payments Table
```sql
CREATE TABLE Payments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    OrderId NVARCHAR(100) NOT NULL UNIQUE,
    PackageId NVARCHAR(50) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'VND',
    Status NVARCHAR(20) NOT NULL, -- pending, completed, failed, expired
    PaymentMethod NVARCHAR(50) DEFAULT 'vnpay',
    VnpayData NVARCHAR(MAX), -- JSON with VNPay response
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (PackageId) REFERENCES PremiumPackages(Id),
    INDEX IX_Payments_UserId (UserId),
    INDEX IX_Payments_OrderId (OrderId),
    INDEX IX_Payments_Status (Status),
    INDEX IX_Payments_CreatedAt (CreatedAt)
);
```


#### GameSessions Table
```sql
CREATE TABLE GameSessions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Mode NVARCHAR(20) NOT NULL, -- normal, premium
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NULL,
    Score INT DEFAULT 0,
    TurnCount INT DEFAULT 0,
    Duration INT NULL, -- seconds
    PremiumApplied BIT DEFAULT 0,
    ScoreBonus DECIMAL(3,2) DEFAULT 0,
    FinalScore INT DEFAULT 0,
    Metadata NVARCHAR(MAX), -- JSON with additional data
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    INDEX IX_GameSessions_UserId (UserId),
    INDEX IX_GameSessions_Score (Score DESC),
    INDEX IX_GameSessions_CreatedAt (CreatedAt DESC)
);
```

#### GameMoves Table (Optional - for anti-cheat)
```sql
CREATE TABLE GameMoves (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL,
    MoveNumber INT NOT NULL,
    FromRow INT NOT NULL,
    FromCol INT NOT NULL,
    ToRow INT NOT NULL,
    ToCol INT NOT NULL,
    PieceType NVARCHAR(20) NOT NULL,
    CapturedPiece NVARCHAR(20) NULL,
    ScoreGained INT DEFAULT 0,
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (SessionId) REFERENCES GameSessions(Id) ON DELETE CASCADE,
    INDEX IX_GameMoves_SessionId (SessionId),
    INDEX IX_GameMoves_MoveNumber (MoveNumber)
);
```

### Seed Data Script

```sql
-- Insert Premium Packages
INSERT INTO PremiumPackages (Id, Name, Price, Currency, DurationDays, ScoreBonus, ReviveCount, Features)
VALUES 
('basic', 'Cơ bản', 29000, 'VND', 7, 0.10, 2, 
 '["+ 10% điểm cho mọi quân cờ","2 lượt hồi sinh miễn phí","Giao diện đặc biệt"]'),
('standard', 'Tiêu chuẩn', 79000, 'VND', 30, 0.20, 5,
 '["+ 20% điểm cho mọi quân cờ","5 lượt hồi sinh miễn phí","Giao diện đặc biệt","Hỗ trợ ưu tiên"]'),
('pro', 'Pro', 199000, 'VND', 90, 0.30, 10,
 '["+ 30% điểm cho mọi quân cờ","10 lượt hồi sinh miễn phí","Giao diện đặc biệt","Hỗ trợ ưu tiên","Badge đặc biệt"]'),
('vip', 'VIP', 499000, 'VND', 365, 0.50, 999999,
 '["+ 50% điểm cho mọi quân cờ","Hồi sinh không giới hạn","Giao diện VIP độc quyền","Hỗ trợ ưu tiên 24/7","Badge VIP","Tên màu vàng"]');
```

## Game Engine Design

### ChessGame Module

**File: src/game/ChessGame.js**

```javascript
export class ChessGame {
  constructor(premiumBonus = 0) {
    this.board = [];
    this.playerXe = null;
    this.enemyPieces = [];
    this.gameMode = 'setup'; // setup | playing | ended
    this.currentTurn = 'player'; // player | enemy
    this.turnCount = 0;
    this.score = 0;
    this.fireModeActive = false;
    this.fireModeRemainingTurns = 0;
    this.premiumBonus = premiumBonus;
    this.gameSession = null;
    this.initBoard();
  }

  // Core Methods
  initBoard() { /* Create 9x8 empty board */ }
  resetGame() { /* Reset to initial state */ }
  placePiece(row, col, type, isEnemy) { /* Place piece on board */ }
  removePiece(row, col) { /* Remove piece from board */ }
  
  // Movement & Validation
  getValidMoves(piece) { /* Calculate valid moves for piece */ }
  isValidPosition(row, col) { /* Check if position is on board */ }
  handlePlayerMove(row, col) { /* Execute player move */ }
  
  // Scoring
  calculateScore(pieceType) { /* Calculate base score */ }
  applyPremiumBonus(baseScore) { /* Apply premium multiplier */ }
  capturePiece(row, col) { /* Capture enemy piece and update score */ }
  
  // Fire Mode
  activateFireMode() { /* Activate fire mode for 3 turns */ }
  executeFireBlast() { /* Blast adjacent enemies */ }
  deactivateFireMode() { /* Deactivate fire mode */ }
  
  // State Management
  getState() { /* Return current game state */ }
  setState(state) { /* Set game state from external source */ }
  validateGameState() { /* Validate state consistency */ }
  
  // Game Flow
  startGame(gameAPI) { /* Start game and create session */ }
  endGame(gameAPI) { /* End game and submit score */ }
  switchTurn() { /* Switch between player and enemy */ }
}
```

### EnemyAI Module

**File: src/game/EnemyAI.js**

```javascript
export class EnemyAI {
  constructor(game) {
    this.game = game;
  }

  // Main AI Decision
  selectBestMove() {
    const categorizedMoves = this.categorizeMoves();
    return this.selectFromCategories(categorizedMoves);
  }

  // Move Analysis
  categorizeMoves() {
    const moves = {
      attacking: [],  // Moves that attack player Xe
      safe: [],       // Moves to safe positions
      trap: []        // Moves that might be traps
    };
    
    for (const piece of this.game.enemyPieces) {
      const validMoves = this.game.getEnemyValidMoves(piece);
      for (const move of validMoves) {
        if (this.isAttackingMove(piece, move)) {
          moves.attacking.push({ piece, move });
        } else if (this.isSafeMove(piece, move)) {
          moves.safe.push({ piece, move });
        } else {
          moves.trap.push({ piece, move });
        }
      }
    }
    
    return moves;
  }

  // Move Evaluation
  isAttackingMove(piece, move) {
    // Check if move attacks player Xe
    return this.canAttackPosition(move, this.game.playerXe);
  }

  isSafeMove(piece, move) {
    // Check if move position is not under attack
    return !this.game.isPositionUnderAttack(move.row, move.col);
  }

  // Move Selection with Weights
  selectFromCategories(categorizedMoves) {
    // Priority: attacking > safe > trap
    if (categorizedMoves.attacking.length > 0) {
      return this.randomSelect(categorizedMoves.attacking);
    }
    if (categorizedMoves.safe.length > 0) {
      return this.randomSelect(categorizedMoves.safe);
    }
    if (categorizedMoves.trap.length > 0) {
      return this.randomSelect(categorizedMoves.trap);
    }
    return null;
  }

  randomSelect(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Execute AI Turn
  async executeTurn() {
    const selectedMove = this.selectBestMove();
    if (selectedMove) {
      return this.game.executeEnemyMove(
        selectedMove.piece,
        selectedMove.move
      );
    }
    return null;
  }
}
```

## Authentication Flow

### JWT Token Strategy

**Access Token:**
- Lifetime: 15 minutes
- Payload: { userId, username, email, iat, exp }
- Used for: All API requests
- Storage: Memory (not persisted)

**Refresh Token:**
- Lifetime: 30 days
- Payload: { userId, tokenId, iat, exp }
- Used for: Getting new access token
- Storage: Database + expo-secure-store

### Token Refresh Flow

```
1. User makes API request with expired access token
   ↓
2. Backend returns 401 with code "TOKEN_EXPIRED"
   ↓
3. Axios interceptor catches 401
   ↓
4. Check if refresh is already in progress (single-flight)
   ↓
5. If not, start refresh:
   - Get refresh token from secure storage
   - Call POST /api/auth/refresh-token
   ↓
6. If refresh succeeds:
   - Save new tokens to secure storage
   - Update axios default headers
   - Retry original request
   ↓
7. If refresh fails:
   - Clear all tokens
   - Redirect to login screen
```

### Single-Flight Refresh Pattern

```javascript
let refreshPromise = null;

async function refreshAccessToken() {
  // If refresh already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start new refresh
  refreshPromise = (async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const response = await axios.post('/auth/refresh-token', {
        refreshToken
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);
      
      return accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
```


## VNPay Integration Flow

### Payment Creation Flow

```
1. User selects premium package in app
   ↓
2. App calls POST /api/payment/vnpay/create
   {
     "packageId": "pro",
     "returnUrl": "toolchess://payment-return"
   }
   ↓
3. Backend creates payment record (status: pending)
   ↓
4. Backend generates VNPay payment URL:
   - Add required parameters (amount, orderId, etc.)
   - Calculate secure hash using VNPay secret key
   - Return payment URL
   ↓
5. App opens payment URL in WebView
   ↓
6. User completes payment on VNPay
   ↓
7. VNPay redirects to returnUrl with payment result
   ↓
8. Backend receives callback at /api/payment/vnpay/return
   ↓
9. Backend verifies VNPay signature
   ↓
10. If valid:
    - Update payment status to "completed"
    - Activate premium subscription
    - Send confirmation email
    ↓
11. App polls GET /api/payment/status/:orderId
    ↓
12. When status is "completed", show success message
```

### VNPay Signature Verification

```javascript
function verifyVNPaySignature(vnpayParams, secretKey) {
  // 1. Remove vnp_SecureHash from params
  const secureHash = vnpayParams.vnp_SecureHash;
  delete vnpayParams.vnp_SecureHash;
  
  // 2. Sort parameters by key
  const sortedParams = Object.keys(vnpayParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpayParams[key];
      return acc;
    }, {});
  
  // 3. Create query string
  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // 4. Calculate HMAC SHA512
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha512', secretKey);
  const calculatedHash = hmac.update(queryString).digest('hex');
  
  // 5. Compare hashes
  return calculatedHash === secureHash;
}
```

### Payment Status Polling

```javascript
// In Mobile App
async function waitForPaymentCompletion(orderId) {
  const maxAttempts = 30; // 30 attempts
  const interval = 2000; // 2 seconds
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await api.get(`/payment/status/${orderId}`);
    const status = response.data.data.status;
    
    if (status === 'completed') {
      return { success: true, status };
    }
    
    if (status === 'failed' || status === 'expired') {
      return { success: false, status };
    }
    
    // Still pending, wait and retry
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  // Timeout
  return { success: false, status: 'timeout' };
}
```

## Email Service Design

### Gmail SMTP Configuration

```javascript
// .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ToolChess <noreply@toolchess.com>
```

### Email Templates

**Verification Email:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background: #8B4513; color: white; padding: 12px 24px; 
              text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Xác minh tài khoản ToolChess</h2>
    <p>Xin chào {{username}},</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản ToolChess. 
       Vui lòng click vào nút bên dưới để xác minh email:</p>
    <p><a href="{{verificationLink}}" class="button">Xác minh Email</a></p>
    <p>Hoặc copy link sau vào trình duyệt:</p>
    <p>{{verificationLink}}</p>
  </div>
</body>
</html>
```

**Payment Confirmation Email:**
```html
<!DOCTYPE html>
<html>
<body>
  <div class="container">
    <h2>Thanh toán thành công!</h2>
    <p>Xin chào {{username}},</p>
    <p>Cảm ơn bạn đã mua gói {{packageName}}.</p>
    <p><strong>Thông tin đơn hàng:</strong></p>
    <ul>
      <li>Mã đơn: {{orderId}}</li>
      <li>Gói: {{packageName}}</li>
      <li>Giá: {{amount}} VND</li>
      <li>Thời hạn: {{duration}} ngày</li>
      <li>Bonus điểm: +{{scoreBonus}}%</li>
    </ul>
    <p>Gói premium của bạn đã được kích hoạt!</p>
  </div>
</body>
</html>
```

## Error Handling Strategy

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "fieldName",
      "value": "invalidValue"
    },
    "timestamp": "2024-01-01T10:00:00Z",
    "requestId": "req_uuid"
  }
}
```

### Error Codes

**Authentication Errors (401):**
- `INVALID_CREDENTIALS`: Wrong email/password
- `TOKEN_EXPIRED`: Access token expired
- `INVALID_REFRESH_TOKEN`: Refresh token invalid
- `TOKEN_REVOKED`: Token has been revoked

**Authorization Errors (403):**
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `PREMIUM_REQUIRED`: Feature requires premium subscription

**Validation Errors (400):**
- `VALIDATION_ERROR`: Input validation failed
- `INVALID_EMAIL`: Email format invalid
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `DUPLICATE_USERNAME`: Username already exists
- `DUPLICATE_EMAIL`: Email already registered

**Payment Errors (400):**
- `INVALID_PACKAGE`: Package ID not found
- `PAYMENT_FAILED`: Payment processing failed
- `PAYMENT_EXPIRED`: Payment session expired
- `INVALID_SIGNATURE`: VNPay signature verification failed

**Game Errors (400):**
- `INVALID_SCORE`: Score validation failed
- `INVALID_SESSION`: Game session not found
- `SESSION_EXPIRED`: Game session expired
- `ANTI_CHEAT_VIOLATION`: Suspicious activity detected

**Server Errors (500):**
- `INTERNAL_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `EMAIL_SEND_FAILED`: Email sending failed

### Error Logging

```javascript
function logError(error, context) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    context: {
      userId: context.userId,
      endpoint: context.endpoint,
      method: context.method,
      ip: context.ip,
      userAgent: context.userAgent
    }
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(JSON.stringify(logEntry, null, 2));
  }
  
  // Log to file/service in production
  if (process.env.NODE_ENV === 'production') {
    // Use winston, bunyan, or cloud logging service
    logger.error(logEntry);
  }
}
```

## Testing Strategy

### Manual Test Checklist

**Authentication Tests:**
- [ ] Register with valid data → Success
- [ ] Register with duplicate email → Error
- [ ] Register with weak password → Error
- [ ] Login with valid credentials → Success + tokens
- [ ] Login with invalid credentials → Error
- [ ] Access protected endpoint with valid token → Success
- [ ] Access protected endpoint with expired token → 401
- [ ] Refresh token with valid refresh token → New tokens
- [ ] Refresh token with invalid refresh token → Error
- [ ] Logout → Token revoked

**Game Flow Tests:**
- [ ] Start game → Session created
- [ ] Place player Xe → Success
- [ ] Move player Xe to valid position → Success
- [ ] Move player Xe to invalid position → Error
- [ ] Capture enemy piece → Score updated
- [ ] Capture Tướng địch → Fire mode activated
- [ ] Fire mode blast → Adjacent enemies destroyed
- [ ] Enemy AI turn → Enemy moves
- [ ] Game end → Score submitted
- [ ] View game history → List of sessions
- [ ] View leaderboard → Ranked players

**Premium & Payment Tests:**
- [ ] View premium packages → List displayed
- [ ] Create payment → Payment URL returned
- [ ] Complete payment → Premium activated
- [ ] Check premium status → Active subscription
- [ ] Play with premium → Bonus applied
- [ ] Premium expires → Bonus removed
- [ ] Payment fails → No premium activation
- [ ] Payment callback with invalid signature → Rejected

**Email Tests:**
- [ ] Send verification email → Email received
- [ ] Send password reset email → Email received
- [ ] Send payment confirmation → Email received
- [ ] Email with invalid SMTP config → Error logged

**Security Tests:**
- [ ] Access endpoint without token → 401
- [ ] Access endpoint with tampered token → 401
- [ ] Attempt SQL injection → Sanitized
- [ ] Attempt XSS → Sanitized
- [ ] Rate limit auth endpoint → 429 after limit
- [ ] Rate limit payment endpoint → 429 after limit


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Board State Consistency

*For any* game state, the board should always be a 9x8 grid with valid piece positions, and all pieces in the enemyPieces array should exist on the board at their claimed positions.

**Validates: Requirements 3.2**

### Property 2: Move Validation Correctness

*For any* piece and any position, if getValidMoves() returns a position as valid, then executing a move to that position should succeed, and if a position is not in the valid moves list, attempting to move there should fail.

**Validates: Requirements 3.3, 3.4**

### Property 3: Score Calculation with Premium Bonus

*For any* captured piece and any premium bonus percentage, the final score should equal the base piece value multiplied by (1 + bonus percentage), rounded down to the nearest integer.

**Validates: Requirements 3.5, 3.7, 9.7**

### Property 4: Fire Mode Activation and Blast

*For any* game state, when the player captures a Tướng địch piece, fire mode should activate, and when fire mode is active and the player moves, all enemy pieces adjacent to the new position should be destroyed.

**Validates: Requirements 3.6**

### Property 5: AI Move Categorization

*For any* game state with enemy pieces, the AI should categorize all possible moves into attacking, safe, or trap categories, and every valid move for every enemy piece should appear in exactly one category.

**Validates: Requirements 4.2, 4.3**

### Property 6: AI Attack Prioritization

*For any* game state where attacking moves exist, the AI should select a move from the attacking category with higher probability than safe or trap moves.

**Validates: Requirements 4.4**

### Property 7: Input Validation Rejection

*For any* registration attempt with invalid email format, weak password, or missing required fields, the system should reject the request with a validation error and not create a user account.

**Validates: Requirements 5.1**

### Property 8: Password Hashing Security

*For any* user registration, the password stored in the database should be a bcrypt hash, not the plain text password, and the hash should be verifiable against the original password.

**Validates: Requirements 5.2, 16.1**

### Property 9: Token Refresh Idempotency

*For any* valid refresh token, calling the refresh endpoint multiple times concurrently should result in only one new token pair being generated, not multiple pairs (single-flight pattern).

**Validates: Requirements 5.10**

### Property 10: Premium Bonus Application

*For any* game session where the user has an active premium subscription, all scores calculated during that session should include the premium bonus multiplier.

**Validates: Requirements 9.7**

### Property 11: VNPay Signature Verification

*For any* VNPay callback with parameters, the signature verification should succeed if and only if the secure hash matches the HMAC-SHA512 of the sorted parameters with the secret key.

**Validates: Requirements 10.6, 16.10**

### Property 12: Score Bounds Validation

*For any* game submission, if the submitted score exceeds the maximum possible score (sum of all enemy piece values with maximum premium bonus), the system should reject the submission with an anti-cheat violation error.

**Validates: Requirements 11.6, 25.1**

### Property 13: Leaderboard Sorting

*For any* leaderboard query, the returned list should be sorted in descending order by highest score, and no player with a higher score should appear after a player with a lower score.

**Validates: Requirements 12.2**

### Property 14: Migration Script Idempotency

*For any* database migration script, running the script multiple times should produce the same final database state as running it once, without errors or duplicate data.

**Validates: Requirements 15.5**

### Property 15: Error Response Format Consistency

*For any* API error response, the response should contain a JSON object with "success": false, an "error" object with "code" and "message" fields, and use the appropriate HTTP status code.

**Validates: Requirements 17.1, 17.2**

### Property 16: Chess Piece Symbol Mapping

*For any* piece type in the game, there should be exactly one corresponding Chinese chess symbol, and the symbol should be correctly displayed for that piece type.

**Validates: Requirements 2.5**

### Property 17: Board Grid Rendering

*For any* chess board render, the component should display exactly 72 cells (9 rows × 8 columns), and each cell should be positioned correctly in the grid.

**Validates: Requirements 2.1**

### Property 18: Rate Limiting Enforcement

*For any* rate-limited endpoint, after exceeding the maximum number of requests within the time window, subsequent requests should return 429 status code until the window resets.

**Validates: Requirements 16.4, 16.5**

## Error Handling

### Frontend Error Handling

**Network Errors:**
- Detect network failures (timeout, connection refused)
- Show user-friendly error messages
- Implement retry logic with exponential backoff
- Support offline mode for game play

**API Errors:**
- Parse error responses consistently
- Map error codes to user messages
- Handle validation errors with field-specific feedback
- Log errors for debugging

**State Errors:**
- Validate game state before operations
- Recover from invalid states gracefully
- Prevent UI from breaking on unexpected data
- Clear corrupted state and restart if needed

### Backend Error Handling

**Validation Errors:**
- Validate all inputs before processing
- Return detailed validation errors
- Use consistent error codes
- Log validation failures

**Database Errors:**
- Handle connection failures
- Implement transaction rollback
- Retry transient errors
- Log all database errors with context

**External Service Errors:**
- Handle VNPay API failures
- Handle SMTP failures
- Implement circuit breaker pattern
- Provide fallback behavior

**Security Errors:**
- Log all authentication failures
- Rate limit after repeated failures
- Alert on suspicious activity
- Never expose sensitive information in errors


## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**
- ChessGame module: Test all game logic functions independently
- EnemyAI module: Test move categorization and selection logic
- Utility functions: Test helper functions (score calculation, validation)
- Component logic: Test component state management and event handlers

**Backend Unit Tests:**
- Service layer: Test business logic in isolation
- Validation logic: Test input validation functions
- Utility functions: Test helpers (password hashing, token generation, signature verification)
- Repository layer: Test data access logic with mocked database

**Test Framework:**
- Frontend: Jest + React Native Testing Library
- Backend: Jest or Mocha + Chai
- Minimum 100 iterations for property-based tests

### Property-Based Testing

**Game Logic Properties:**
- Use fast-check (JavaScript) for property-based testing
- Generate random board states and verify invariants
- Generate random moves and verify validation logic
- Generate random scores and verify bonus calculations

**API Properties:**
- Generate random valid/invalid inputs
- Verify error handling consistency
- Verify response format consistency
- Verify security measures (rate limiting, validation)

**Example Property Test:**
```javascript
import fc from 'fast-check';

describe('ChessGame - Score Calculation', () => {
  it('Property 3: Score with premium bonus', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // base score
        fc.float({ min: 0, max: 1 }), // premium bonus (0-100%)
        (baseScore, bonus) => {
          const game = new ChessGame(bonus);
          const finalScore = game.applyPremiumBonus(baseScore);
          const expected = Math.floor(baseScore * (1 + bonus));
          return finalScore === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**API Integration Tests:**
- Test complete request/response cycles
- Test authentication flow (register → login → refresh → logout)
- Test game flow (start → play → submit)
- Test payment flow (create → callback → verify)
- Use test database with seed data
- Clean up after each test

**Frontend Integration Tests:**
- Test screen navigation flows
- Test API integration with mocked backend
- Test state management across components
- Test error handling and recovery

### End-to-End Testing

**Critical User Flows:**
- Complete registration and login flow
- Complete game play session
- Complete premium purchase flow
- View leaderboard and history

**Manual Testing:**
- Follow manual test checklist (see Requirements 22.2)
- Test on real devices (Android/iOS)
- Test with real VNPay sandbox
- Test email delivery

### Performance Testing

**Load Testing:**
- Test API endpoints under load
- Measure response times
- Identify bottlenecks
- Test database query performance

**Stress Testing:**
- Test with maximum concurrent users
- Test with large datasets
- Test memory usage
- Test connection pool limits

### Security Testing

**Penetration Testing:**
- Test SQL injection prevention
- Test XSS prevention
- Test CSRF protection
- Test rate limiting
- Test authentication bypass attempts

**Code Security Review:**
- Review for hardcoded secrets
- Review for insecure dependencies
- Review for insecure configurations
- Use security linting tools

## Deployment Strategy

### Environment Configuration

**Development Environment:**
- Local SQL Server database
- VNPay sandbox
- Gmail SMTP with test account
- Debug logging enabled
- CORS allowing all origins

**Staging Environment:**
- Staging SQL Server database
- VNPay sandbox
- Gmail SMTP with staging account
- Info logging enabled
- CORS allowing staging domains
- Same configuration as production

**Production Environment:**
- Production SQL Server database
- VNPay production
- Gmail SMTP with production account
- Error logging only
- CORS allowing production domains only
- Rate limiting enabled
- Security headers enabled

### Database Migration Strategy

**Migration Process:**
1. Backup current database
2. Run migration scripts in transaction
3. Verify migration success
4. Rollback if any errors
5. Update schema version

**Migration Scripts:**
- Version controlled (e.g., V001_initial_schema.sql)
- Idempotent (can run multiple times)
- Include rollback scripts
- Tested in staging first

### Deployment Checklist

**Backend Deployment:**
- [ ] Update .env with production values
- [ ] Run database migrations
- [ ] Deploy new code
- [ ] Restart server
- [ ] Verify health check endpoint
- [ ] Monitor logs for errors
- [ ] Test critical endpoints

**Frontend Deployment:**
- [ ] Update API URL to production
- [ ] Build production APK/IPA
- [ ] Test on real devices
- [ ] Submit to app stores (if applicable)
- [ ] Monitor crash reports

## Risk Analysis and Mitigation

### Risk 1: VNPay Integration Issues

**Risks:**
- Signature verification failures
- Callback not received
- Payment status inconsistency
- Timeout issues

**Mitigation:**
- Thoroughly test signature algorithm
- Implement payment status polling
- Store all VNPay responses for debugging
- Implement webhook retry mechanism
- Add manual payment verification for support team
- Test extensively in sandbox before production

### Risk 2: Refresh Token Spam

**Risks:**
- Multiple concurrent refresh requests
- Token race conditions
- Database deadlocks
- Inconsistent token state

**Mitigation:**
- Implement single-flight pattern
- Use database transactions
- Add request deduplication
- Implement token versioning
- Add monitoring for refresh failures
- Test concurrent refresh scenarios

### Risk 3: Anti-Cheat Bypass

**Risks:**
- Score manipulation
- Move validation bypass
- Session replay attacks
- Time manipulation

**Mitigation:**
- Validate all scores server-side
- Store move history for verification
- Implement score bounds checking
- Add time-based validation
- Monitor for suspicious patterns
- Implement progressive penalties
- Add manual review for high scores

### Risk 4: Database Performance

**Risks:**
- Slow queries on large datasets
- Connection pool exhaustion
- Deadlocks
- Index fragmentation

**Mitigation:**
- Add proper indexes on all foreign keys
- Implement connection pooling
- Use query optimization
- Add database monitoring
- Implement caching for read-heavy operations
- Regular database maintenance
- Load testing before launch

### Risk 5: Email Delivery Failures

**Risks:**
- SMTP connection failures
- Rate limiting by Gmail
- Emails marked as spam
- Invalid email addresses

**Mitigation:**
- Implement email queue with retry
- Use exponential backoff
- Add email delivery monitoring
- Validate email addresses before sending
- Use proper SPF/DKIM configuration
- Provide alternative verification methods
- Log all email attempts

### Risk 6: Mobile App Offline Behavior

**Risks:**
- Data loss when offline
- Sync conflicts
- Stale data display
- Poor user experience

**Mitigation:**
- Implement offline game mode
- Queue API requests when offline
- Sync when connection restored
- Show clear offline indicators
- Cache essential data locally
- Handle sync conflicts gracefully
- Test offline scenarios thoroughly

### Risk 7: Token Storage Security

**Risks:**
- Token theft from device
- Insecure storage
- Token leakage in logs
- Backup exposure

**Mitigation:**
- Use expo-secure-store (encrypted)
- Never log tokens
- Implement token rotation
- Add device binding
- Implement suspicious activity detection
- Allow remote token revocation
- Educate users on device security

### Risk 8: Rate Limiting Bypass

**Risks:**
- Distributed attacks
- IP spoofing
- Rate limit circumvention
- Resource exhaustion

**Mitigation:**
- Implement multiple rate limit strategies
- Use user-based and IP-based limits
- Add CAPTCHA for suspicious activity
- Monitor for attack patterns
- Implement progressive delays
- Add IP blacklisting
- Use CDN/WAF for DDoS protection

## Performance Optimization

### Frontend Optimization

**React Native Performance:**
- Use FlatList for long lists
- Implement virtualization
- Optimize re-renders with React.memo
- Use useMemo and useCallback
- Lazy load screens
- Optimize images (compress, resize)
- Minimize bundle size

**Game Engine Optimization:**
- Cache valid moves calculations
- Use efficient data structures
- Minimize object creation
- Batch state updates
- Optimize AI decision making
- Profile and optimize hot paths

### Backend Optimization

**API Performance:**
- Implement response caching
- Use database connection pooling
- Optimize database queries
- Add database indexes
- Implement pagination
- Use compression (gzip)
- Minimize response payload size

**Database Optimization:**
- Create indexes on frequently queried columns
- Optimize JOIN operations
- Use appropriate data types
- Implement query caching
- Regular index maintenance
- Monitor slow queries
- Use database profiling tools

### Caching Strategy

**Frontend Caching:**
- Cache API responses (with TTL)
- Cache game assets
- Cache user profile
- Cache premium packages
- Implement cache invalidation

**Backend Caching:**
- Cache leaderboard (5 minutes TTL)
- Cache premium packages (1 hour TTL)
- Cache user premium status (5 minutes TTL)
- Use Redis for distributed caching
- Implement cache warming

## Monitoring and Logging

### Application Monitoring

**Metrics to Track:**
- API response times
- Error rates
- Request rates
- Database query times
- Memory usage
- CPU usage
- Active users
- Game sessions per hour

**Monitoring Tools:**
- Application Performance Monitoring (APM)
- Database monitoring
- Server monitoring
- Log aggregation
- Alert system

### Logging Strategy

**Log Levels:**
- ERROR: All errors and exceptions
- WARN: Warnings and potential issues
- INFO: Important business events
- DEBUG: Detailed debugging information (dev only)

**What to Log:**
- All API requests (method, path, status, duration)
- All errors with stack traces
- Authentication events (login, logout, refresh)
- Payment events (create, complete, fail)
- Game events (start, end, high scores)
- Security events (rate limit, suspicious activity)

**Log Format:**
```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "info",
  "message": "User logged in",
  "context": {
    "userId": "uuid",
    "ip": "192.168.1.1",
    "userAgent": "...",
    "endpoint": "/api/auth/login"
  }
}
```

### Alerting

**Critical Alerts:**
- API error rate > 5%
- Database connection failures
- Payment processing failures
- Email delivery failures
- High memory/CPU usage
- Security incidents

**Alert Channels:**
- Email notifications
- SMS for critical issues
- Slack/Discord integration
- PagerDuty for on-call

## Documentation Requirements

### API Documentation

**Swagger/OpenAPI Specification:**
- All endpoints documented
- Request/response schemas
- Authentication requirements
- Error responses
- Example requests/responses

### Code Documentation

**Frontend Documentation:**
- Component props and usage
- Game engine API
- State management patterns
- Navigation structure

**Backend Documentation:**
- Service layer APIs
- Database schema
- Environment variables
- Deployment process

### User Documentation

**Player Guide:**
- How to play
- Game rules
- Premium features
- Payment process
- FAQ

**Developer Guide:**
- Setup instructions
- Architecture overview
- Development workflow
- Testing guide
- Deployment guide
