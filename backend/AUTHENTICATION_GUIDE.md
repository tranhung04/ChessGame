# Authentication System Guide

## Overview

The ToolChess authentication system implements a secure JWT-based authentication with refresh tokens. It includes:

- User registration with password strength validation
- Login with bcrypt password hashing (12 rounds)
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (30 days)
- Token refresh mechanism
- Logout with token revocation
- Rate limiting on auth endpoints

## Architecture

### Components

1. **Password Service** (`services/passwordService.js`)
   - Password hashing with bcrypt (12 rounds)
   - Password strength validation
   - Password verification

2. **Token Service** (`services/tokenService.js`)
   - JWT token generation (access & refresh)
   - Token verification and decoding
   - Token expiry management

3. **Auth Service** (`services/authService.js`)
   - Registration logic
   - Login logic
   - Token refresh logic
   - Logout logic

4. **User Repository** (`repositories/userRepository.js`)
   - Database operations for users
   - CRUD operations
   - Email/username uniqueness checks

5. **RefreshToken Repository** (`repositories/refreshTokenRepository.js`)
   - Database operations for refresh tokens
   - Token storage and retrieval
   - Token revocation
   - Expired token cleanup

6. **Auth Controller** (`controllers/authController.js`)
   - HTTP request handling
   - Input validation
   - Error responses

7. **Auth Middleware** (`middleware/auth.js`)
   - JWT token verification
   - Request authentication
   - User context injection

## API Endpoints

### POST /api/auth/register

Register a new user.

**Request:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "Id": "uuid",
      "Username": "player123",
      "Email": "player@example.com",
      "IsEmailVerified": false,
      "CreatedAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

**Errors:**
- 400 VALIDATION_ERROR: Missing required fields
- 400 INVALID_EMAIL: Invalid email format
- 400 WEAK_PASSWORD: Password doesn't meet requirements
- 400 DUPLICATE_EMAIL: Email already registered
- 400 DUPLICATE_USERNAME: Username already taken

### POST /api/auth/login

Login with email and password.

**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "Id": "uuid",
      "Username": "player123",
      "Email": "player@example.com"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

**Errors:**
- 400 VALIDATION_ERROR: Missing required fields
- 401 INVALID_CREDENTIALS: Wrong email or password

### POST /api/auth/refresh-token

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

**Errors:**
- 400 VALIDATION_ERROR: Missing refresh token
- 401 INVALID_REFRESH_TOKEN: Invalid or expired refresh token

### POST /api/auth/logout

Logout and revoke refresh token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/logout-all

Logout from all devices (requires authentication).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out from 3 device(s)"
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters optional (can be configured)

## Token Configuration

### Access Token
- Expiry: 15 minutes
- Payload: userId, username, email, type
- Used for: API authentication
- Storage: Memory (not persisted)

### Refresh Token
- Expiry: 30 days
- Payload: userId, tokenId, type
- Used for: Getting new access tokens
- Storage: Database + Client secure storage

## Rate Limiting

### Authentication Endpoints (register, login)
- Window: 1 minute
- Max requests: 5
- Error: 429 AUTH_RATE_LIMIT_EXCEEDED

### Refresh Token Endpoint
- Window: 1 minute
- Max requests: 10
- Error: 429 RATE_LIMIT_EXCEEDED

## Security Features

1. **Password Hashing**
   - bcrypt with 12 rounds
   - Automatic rehashing if rounds change

2. **Token Security**
   - Separate secrets for access and refresh tokens
   - Short-lived access tokens
   - Refresh token rotation on use
   - Token revocation support

3. **Rate Limiting**
   - Prevents brute force attacks
   - Configurable limits per endpoint

4. **Input Validation**
   - Email format validation
   - Password strength validation
   - SQL injection prevention

5. **Error Handling**
   - Consistent error format
   - No sensitive information in errors
   - Proper HTTP status codes

## Environment Variables

Required environment variables in `.env`:

```env
# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Database Configuration
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=ToolChessDB
DB_USER=sa
DB_PASSWORD=your_password

# Rate Limiting
AUTH_RATE_LIMIT_MAX=5
```

## Testing

### Manual Testing

1. Start the server:
```bash
npm run dev
```

2. Run the test script:
```bash
node test-auth.js
```

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your_refresh_token_here"}'
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your_refresh_token_here"}'
```

## Database Schema

### Users Table
```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    IsEmailVerified BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### RefreshTokens Table
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
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
```

## Common Issues

### Issue: "Failed to connect to database"
**Solution:** Ensure SQL Server is running and credentials in `.env` are correct.

### Issue: "DUPLICATE_EMAIL" error
**Solution:** Email already exists. Use a different email or login instead.

### Issue: "WEAK_PASSWORD" error
**Solution:** Password must meet requirements (8+ chars, uppercase, lowercase, number).

### Issue: "TOKEN_EXPIRED" error
**Solution:** Access token expired. Use refresh token to get a new one.

### Issue: "INVALID_REFRESH_TOKEN" error
**Solution:** Refresh token is invalid or expired. User must login again.

## Best Practices

1. **Token Storage (Client)**
   - Store access token in memory
   - Store refresh token in secure storage (expo-secure-store)
   - Never log tokens

2. **Token Refresh**
   - Implement automatic refresh on 401 errors
   - Use single-flight pattern to prevent multiple refresh requests
   - Retry original request after refresh

3. **Error Handling**
   - Handle all error codes appropriately
   - Show user-friendly messages
   - Log errors for debugging

4. **Security**
   - Use HTTPS in production
   - Rotate JWT secrets regularly
   - Monitor for suspicious activity
   - Implement account lockout after failed attempts

## Next Steps

After authentication is working:

1. Implement user profile endpoints
2. Add email verification
3. Add password reset functionality
4. Implement premium subscription system
5. Add game session management
