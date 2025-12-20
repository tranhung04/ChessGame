# ToolChess Rebuild - Architecture Overview

## Executive Summary

This document provides a comprehensive overview of the ToolChess Rebuild project architecture, including technology stack, system design, API contracts, database schema, and risk mitigation strategies.

## Technology Stack

### Frontend
- **Framework**: React Native 0.81.5 with Expo 54.0.23
- **Language**: JavaScript (ES6+)
- **UI Library**: React 19.1.0
- **Navigation**: @react-navigation/native 7.1.18
- **State Management**: Context API
- **HTTP Client**: Axios 1.12.2
- **Secure Storage**: expo-secure-store 15.0.7
- **Graphics**: react-native-svg 15.12.1
- **Platform**: Android (primary), iOS (optional)

### Backend
- **Runtime**: NodeJS (LTS version)
- **Framework**: Express.js or NestJS
- **Language**: JavaScript/TypeScript
- **Database Driver**: mssql (node-mssql)
- **Authentication**: jsonwebtoken
- **Password Hashing**: bcrypt
- **Email**: nodemailer
- **Validation**: zod or joi
- **Security**: helmet, cors
- **Rate Limiting**: express-rate-limit

### Database
- **DBMS**: Microsoft SQL Server
- **Version**: SQL Server 2019 or later
- **Connection**: Connection pooling via mssql driver
- **Migration**: Custom SQL scripts

### External Services
- **Payment Gateway**: VNPay (Vietnam)
- **Email Service**: Gmail SMTP
- **Monitoring**: Application logs + optional APM

## System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                   (React Native Mobile App)                  │
│                                                              │
│  - User Interface (Screens & Components)                     │
│  - Client-Side State Management (Context API)               │
│  - Local Storage (expo-secure-store)                        │
│  - Game Engine (Pure Logic - No Backend Dependency)         │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│                    (NodeJS Backend API)                      │
│                                                              │
│  - API Routes & Controllers                                  │
│  - Business Logic Services                                   │
│  - Authentication & Authorization                            │
│  - Payment Processing                                        │
│  - Email Notifications                                       │
│  - Anti-Cheat Validation                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                      SQL Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│                   (SQL Server Database)                      │
│                                                              │
│  - User Data & Authentication                                │
│  - Game Sessions & Leaderboard                               │
│  - Premium Subscriptions                                     │
│  - Payment Records                                           │
│  - Audit Logs                                                │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action (Mobile App)
    ↓
UI Component (React Native)
    ↓
Context/State Update
    ↓
API Service Call (Axios)
    ↓
[Request Interceptor: Add JWT Token]
    ↓
Backend API Endpoint
    ↓
[Middleware: Auth, Validation, Rate Limit]
    ↓
Controller
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
SQL Server Database
    ↓
[Response]
    ↓
[Response Interceptor: Handle 401, Refresh Token]
    ↓
Update UI State
    ↓
Re-render Component
```

## API Endpoints Summary

### Authentication APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| POST | /api/auth/refresh-token | Refresh access token | No |
| POST | /api/auth/logout | Logout user | Yes |

### User Profile APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/user/me | Get current user profile | Yes |
| PUT | /api/user/me | Update user profile | Yes |

### Premium APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/premium/packages | Get all premium packages | No |
| POST | /api/premium/subscribe | Activate premium subscription | Yes |

### Payment APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/payment/vnpay/create | Create VNPay payment | Yes |
| GET | /api/payment/vnpay/return | VNPay callback handler | No |
| GET | /api/payment/status/:orderId | Get payment status | Yes |

### Game APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/game/start | Start new game session | Yes |
| POST | /api/game/submit | Submit game result | Yes |
| GET | /api/game/history | Get user game history | Yes |
| GET | /api/game/leaderboard | Get leaderboard | No |

### Email APIs (Admin Only)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/email/send | Send email (testing) | Yes (Admin) |

## Database Schema Summary

### Core Tables

**Users**
- Primary user account information
- Credentials (hashed password)
- Email verification status
- Timestamps

**RefreshTokens**
- Active refresh tokens per user/device
- Expiration tracking
- Revocation support

**PremiumPackages**
- Available premium tiers
- Pricing and benefits
- Feature lists

**UserPremiumSubscriptions**
- Active/expired subscriptions
- Start and end dates
- Revive usage tracking

**Payments**
- Payment transaction records
- VNPay integration data
- Status tracking

**GameSessions**
- Individual game records
- Scores and statistics
- Premium bonus application

**GameMoves** (Optional)
- Move-by-move history
- Anti-cheat verification data

### Key Relationships

```
Users (1) ──< (N) RefreshTokens
Users (1) ──< (N) UserPremiumSubscriptions
Users (1) ──< (N) Payments
Users (1) ──< (N) GameSessions

PremiumPackages (1) ──< (N) UserPremiumSubscriptions
PremiumPackages (1) ──< (N) Payments

GameSessions (1) ──< (N) GameMoves
```

### Indexes for Performance

```sql
-- Users
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Username ON Users(Username);

-- RefreshTokens
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
CREATE INDEX IX_RefreshTokens_ExpiresAt ON RefreshTokens(ExpiresAt);

-- GameSessions
CREATE INDEX IX_GameSessions_UserId ON GameSessions(UserId);
CREATE INDEX IX_GameSessions_Score ON GameSessions(Score DESC);
CREATE INDEX IX_GameSessions_CreatedAt ON GameSessions(CreatedAt DESC);

-- Payments
CREATE INDEX IX_Payments_UserId ON Payments(UserId);
CREATE INDEX IX_Payments_OrderId ON Payments(OrderId);
CREATE INDEX IX_Payments_Status ON Payments(Status);
```

## Chess Board Port Strategy

### Web Version Analysis

The original web version uses:
- HTML/CSS for board rendering
- JavaScript for game logic
- DOM manipulation for piece movement
- CSS classes for highlighting

### React Native Port Approach

**Option 1: View-Based Rendering (Recommended)**
```javascript
// Pros: Simple, performant, easy to style
// Cons: Less flexible for complex shapes

<View style={styles.board}>
  {board.map((row, rowIndex) => (
    <View key={rowIndex} style={styles.row}>
      {row.map((cell, colIndex) => (
        <TouchableOpacity
          key={colIndex}
          style={[
            styles.cell,
            getCellColor(rowIndex, colIndex),
            isHighlighted(rowIndex, colIndex) && styles.highlighted
          ]}
          onPress={() => handleCellPress(rowIndex, colIndex)}
        >
          {cell && <ChessPiece piece={cell} />}
        </TouchableOpacity>
      ))}
    </View>
  ))}
</View>
```

**Option 2: SVG-Based Rendering**
```javascript
// Pros: Scalable, precise control, animations
// Cons: More complex, potential performance issues

<Svg width={boardWidth} height={boardHeight}>
  {/* Grid lines */}
  {renderGridLines()}
  
  {/* Pieces */}
  {pieces.map(piece => (
    <SvgText
      key={piece.id}
      x={piece.col * cellSize}
      y={piece.row * cellSize}
      fontSize={pieceSize}
      fill={piece.isEnemy ? 'red' : 'blue'}
    >
      {getPieceSymbol(piece.type)}
    </SvgText>
  ))}
  
  {/* Highlights */}
  {validMoves.map(move => (
    <Circle
      key={`${move.row}-${move.col}`}
      cx={move.col * cellSize}
      cy={move.row * cellSize}
      r={highlightRadius}
      fill="rgba(0,255,0,0.3)"
    />
  ))}
</Svg>
```

**Recommended: Hybrid Approach**
- Use View-based for board grid and cells
- Use Text components for Chinese chess symbols
- Use View overlays for highlights
- Keep styling consistent with web version

### Interaction Mapping

| Web Interaction | React Native Equivalent |
|----------------|------------------------|
| Click cell | TouchableOpacity onPress |
| Hover highlight | Not applicable (mobile) |
| Drag piece | PanResponder (optional) |
| CSS transitions | Animated API |
| CSS classes | StyleSheet styles |

### Styling Consistency

```javascript
// Match web version colors
const COLORS = {
  boardLight: '#F5DEB3',  // Wheat
  boardDark: '#CD853F',   // Peru
  playerPiece: '#4682B4', // Steel Blue
  enemyPiece: '#FF6347',  // Tomato
  highlight: 'rgba(0,255,0,0.3)',
  selected: 'rgba(255,255,0,0.5)'
};

// Match web version dimensions
const CELL_SIZE = Dimensions.get('window').width / 8;
const BOARD_WIDTH = CELL_SIZE * 8;
const BOARD_HEIGHT = CELL_SIZE * 9;
```

## Risk Analysis and Mitigation

### Critical Risks

#### 1. VNPay Integration Failures

**Risk Level**: HIGH

**Potential Issues**:
- Signature verification failures due to encoding issues
- Callback not received (network issues, wrong URL)
- Payment status inconsistency (user paid but not activated)
- Timeout during payment process

**Mitigation Strategies**:
1. **Thorough Testing**:
   - Test signature algorithm with VNPay test cases
   - Test all callback scenarios (success, failure, timeout)
   - Test with various payment amounts and currencies

2. **Robust Error Handling**:
   - Log all VNPay requests and responses
   - Store raw callback data for debugging
   - Implement payment status polling as backup
   - Add manual verification interface for support team

3. **Monitoring**:
   - Alert on signature verification failures
   - Monitor payment completion rate
   - Track time between payment and activation

4. **Fallback Mechanisms**:
   - Webhook retry with exponential backoff
   - Manual payment verification process
   - Customer support escalation path

**Code Example**:
```javascript
// Robust signature verification with logging
function verifyVNPaySignature(params, secretKey) {
  try {
    // Log raw params for debugging
    logger.info('VNPay callback received', { params });
    
    // Verify signature
    const isValid = calculateAndCompareSignature(params, secretKey);
    
    if (!isValid) {
      logger.error('VNPay signature verification failed', {
        params,
        calculatedHash: calculateHash(params, secretKey)
      });
    }
    
    return isValid;
  } catch (error) {
    logger.error('VNPay signature verification error', { error, params });
    return false;
  }
}
```

#### 2. Refresh Token Race Conditions

**Risk Level**: MEDIUM

**Potential Issues**:
- Multiple concurrent refresh requests
- Token invalidation race conditions
- Database deadlocks on token table
- Inconsistent token state across requests

**Mitigation Strategies**:
1. **Single-Flight Pattern**:
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

2. **Database Transactions**:
```javascript
async function refreshToken(oldRefreshToken) {
  const transaction = await db.beginTransaction();
  
  try {
    // Lock the token row
    const token = await db.query(
      'SELECT * FROM RefreshTokens WHERE Token = @token WITH (UPDLOCK)',
      { token: oldRefreshToken }
    );
    
    if (!token || token.ExpiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }
    
    // Revoke old token
    await db.query(
      'UPDATE RefreshTokens SET RevokedAt = GETUTCDATE() WHERE Id = @id',
      { id: token.Id }
    );
    
    // Create new tokens
    const newAccessToken = generateAccessToken(token.UserId);
    const newRefreshToken = generateRefreshToken();
    
    // Store new refresh token
    await db.query(
      'INSERT INTO RefreshTokens (UserId, Token, ExpiresAt) VALUES (@userId, @token, @expiresAt)',
      {
        userId: token.UserId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    );
    
    await transaction.commit();
    
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

3. **Request Deduplication**:
- Add request ID to refresh requests
- Track in-flight refresh requests
- Return cached result for duplicate requests

#### 3. Anti-Cheat Bypass

**Risk Level**: MEDIUM

**Potential Issues**:
- Score manipulation (submitting impossible scores)
- Move validation bypass (invalid moves)
- Session replay attacks
- Time manipulation (completing game too fast)

**Mitigation Strategies**:
1. **Server-Side Validation**:
```javascript
function validateGameSubmission(session, submission) {
  const errors = [];
  
  // Validate score bounds
  const maxPossibleScore = calculateMaxScore(session.premiumBonus);
  if (submission.score > maxPossibleScore) {
    errors.push({
      code: 'SCORE_TOO_HIGH',
      message: `Score ${submission.score} exceeds maximum ${maxPossibleScore}`
    });
  }
  
  // Validate time
  const minDuration = calculateMinDuration(submission.turnCount);
  if (submission.duration < minDuration) {
    errors.push({
      code: 'DURATION_TOO_SHORT',
      message: `Duration ${submission.duration}s is suspiciously short`
    });
  }
  
  // Validate move count
  if (submission.turnCount > 1000) {
    errors.push({
      code: 'TOO_MANY_TURNS',
      message: 'Turn count exceeds reasonable limit'
    });
  }
  
  // Validate moves if provided
  if (submission.moves) {
    const moveValidation = validateMoveSequence(submission.moves);
    if (!moveValidation.valid) {
      errors.push({
        code: 'INVALID_MOVES',
        message: 'Move sequence contains invalid moves',
        details: moveValidation.errors
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

2. **Move History Storage**:
- Store all moves in GameMoves table
- Replay moves server-side to verify score
- Flag suspicious sessions for manual review

3. **Statistical Analysis**:
- Track average scores per user
- Flag outliers (scores 3+ standard deviations above mean)
- Monitor score progression over time
- Detect sudden skill improvements

4. **Rate Limiting**:
- Limit game submissions to 10 per hour
- Increase limit for premium users
- Temporary ban for repeated violations

#### 4. Database Performance Degradation

**Risk Level**: MEDIUM

**Potential Issues**:
- Slow queries on large datasets
- Connection pool exhaustion
- Deadlocks during high concurrency
- Index fragmentation over time

**Mitigation Strategies**:
1. **Proper Indexing**:
```sql
-- Leaderboard query optimization
CREATE INDEX IX_GameSessions_Score_UserId 
ON GameSessions(Score DESC, UserId) 
INCLUDE (CreatedAt, PremiumApplied);

-- User history query optimization
CREATE INDEX IX_GameSessions_UserId_CreatedAt 
ON GameSessions(UserId, CreatedAt DESC) 
INCLUDE (Score, TurnCount, Duration);

-- Payment lookup optimization
CREATE INDEX IX_Payments_OrderId_Status 
ON Payments(OrderId, Status) 
INCLUDE (UserId, Amount, CreatedAt);
```

2. **Connection Pooling**:
```javascript
const pool = new sql.ConnectionPool({
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000
  }
});
```

3. **Query Optimization**:
- Use EXPLAIN to analyze query plans
- Avoid N+1 queries
- Use pagination for large result sets
- Cache frequently accessed data

4. **Monitoring**:
- Track slow queries (> 1 second)
- Monitor connection pool usage
- Alert on deadlocks
- Regular index maintenance

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review completed
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Database migrations tested
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] Alerts configured

### Backend Deployment

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] VNPay credentials configured
- [ ] Gmail SMTP configured
- [ ] SSL certificates installed
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health check endpoint working

### Frontend Deployment

- [ ] API URL updated to production
- [ ] Build configuration verified
- [ ] APK/IPA signed
- [ ] Tested on real devices
- [ ] Crash reporting configured
- [ ] Analytics configured (optional)
- [ ] App store metadata prepared

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Critical user flows tested
- [ ] Monitoring dashboards checked
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] User feedback monitored

## Success Metrics

### Technical Metrics
- API response time < 200ms (p95)
- Error rate < 1%
- Uptime > 99.9%
- Database query time < 100ms (p95)
- Mobile app crash rate < 0.1%

### Business Metrics
- User registration rate
- Daily active users (DAU)
- Game completion rate
- Premium conversion rate
- Payment success rate
- User retention (D1, D7, D30)

### Quality Metrics
- Test coverage > 80%
- Code review completion rate 100%
- Security vulnerabilities: 0 critical, 0 high
- Performance regression: 0

## Conclusion

This architecture provides a solid foundation for the ToolChess Rebuild project with:
- Clear separation of concerns (Frontend, Backend, Database)
- Robust security measures (JWT, bcrypt, rate limiting)
- Scalable design (connection pooling, caching, indexing)
- Comprehensive error handling
- Thorough testing strategy
- Risk mitigation plans

The project is designed to be maintainable, secure, and performant while delivering a great user experience.
