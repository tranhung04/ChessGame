# Security Checklist

This checklist ensures all security requirements are met before deployment.

## Pre-Deployment Security Checklist

### 🔐 Secrets and Credentials

- [ ] **JWT Secrets**: Strong random secrets generated (64+ characters)
  - Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - Update `JWT_ACCESS_SECRET` in `.env`
  - Update `JWT_REFRESH_SECRET` in `.env`
  - **Requirement**: 16.1, 16.2

- [ ] **Database Password**: Strong password set (16+ characters)
  - Not using default password (123456, password, admin, etc.)
  - Mix of uppercase, lowercase, numbers, special characters
  - **Requirement**: 16.1

- [ ] **VNPay Credentials**: Production credentials configured
  - `VNPAY_TMN_CODE` set to actual merchant code
  - `VNPAY_HASH_SECRET` set to actual hash secret
  - **Requirement**: 10.4, 10.5, 16.10

- [ ] **Gmail SMTP**: App password configured (not regular password)
  - Generated at: https://myaccount.google.com/apppasswords
  - 16-character app password set in `SMTP_PASS`
  - **Requirement**: 13.1, 13.2

- [ ] **No Hardcoded Secrets**: Code files don't contain hardcoded secrets
  - Run: `npm run security:audit`
  - All secrets use `process.env.*`
  - **Requirement**: 16.1

### 🌐 CORS Configuration

- [ ] **Specific Origins**: CORS not set to wildcard (*)
  - `CORS_ORIGIN` contains specific domains
  - Example: `https://yourdomain.com,https://app.yourdomain.com`
  - **Requirement**: 16.7

- [ ] **Credentials Enabled**: CORS credentials set to true
  - Allows authenticated requests
  - **Requirement**: 16.7

### 🚦 Rate Limiting

- [ ] **Auth Rate Limiting**: 5 requests/minute configured
  - `AUTH_RATE_LIMIT_MAX=5` in `.env`
  - Applied to login, register endpoints
  - **Requirement**: 16.4

- [ ] **Payment Rate Limiting**: 3 requests/minute configured
  - `PAYMENT_RATE_LIMIT_MAX=3` in `.env`
  - Applied to payment creation endpoint
  - **Requirement**: 16.5

- [ ] **Game Submission Rate Limiting**: 10 games/hour configured
  - Applied to game submit endpoint
  - **Requirement**: 25.6

- [ ] **General API Rate Limiting**: 100 requests/minute configured
  - `RATE_LIMIT_MAX_REQUESTS=100` in `.env`
  - Applied to all API endpoints
  - **Requirement**: 16.4

### 🛡️ Input Validation

- [ ] **Email Validation**: Email format validated
  - Joi schema validates email format
  - **Requirement**: 5.1, 16.6

- [ ] **Password Strength**: Password requirements enforced
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - **Requirement**: 5.2, 16.6

- [ ] **Username Validation**: Username format validated
  - Alphanumeric only
  - 3-50 characters
  - **Requirement**: 5.1, 16.6

- [ ] **Score Validation**: Game scores validated
  - Minimum 0
  - Maximum reasonable value
  - Integer only
  - **Requirement**: 11.6, 25.1

- [ ] **Input Sanitization**: All inputs sanitized
  - Joi `stripUnknown: true` enabled
  - No unvalidated data reaches database
  - **Requirement**: 16.6

### 🔒 Authentication & Authorization

- [ ] **JWT Token Expiry**: Proper token expiry configured
  - Access token: 15 minutes (`JWT_ACCESS_EXPIRY=15m`)
  - Refresh token: 30 days (`JWT_REFRESH_EXPIRY=30d`)
  - **Requirement**: 5.5, 5.6, 16.2, 16.3

- [ ] **Token Verification**: JWT tokens properly verified
  - Signature verification enabled
  - Expiry checked
  - Invalid tokens rejected
  - **Requirement**: 16.2

- [ ] **Refresh Token Storage**: Refresh tokens stored in database
  - Can be revoked
  - Tracked by user and device
  - **Requirement**: 5.4, 16.3

- [ ] **Protected Endpoints**: Authentication middleware applied
  - All protected routes use `authenticate` middleware
  - Proper 401 responses for unauthorized access
  - **Requirement**: 5.5

### 🗄️ Database Security

- [ ] **Parameterized Queries**: All queries use parameters
  - No string concatenation in SQL
  - All inputs use `.input()` method
  - **Requirement**: 16.6

- [ ] **SQL Injection Prevention**: Tested and verified
  - Run: `npm run security:test`
  - All injection attempts fail
  - **Requirement**: 16.6

- [ ] **Connection Encryption**: Database connection encrypted
  - `DB_ENCRYPT=true` in production
  - SSL/TLS enabled
  - **Requirement**: 16.1

- [ ] **Connection Pooling**: Proper connection management
  - Pool size configured (max: 10, min: 0)
  - Idle timeout set (30 seconds)
  - **Requirement**: Performance

### 🔐 Password Security

- [ ] **Bcrypt Hashing**: Passwords hashed with bcrypt
  - Salt rounds: 12 or higher
  - Never store plain text passwords
  - **Requirement**: 5.2, 16.1

- [ ] **Password Comparison**: Secure password verification
  - Use `bcrypt.compare()` for verification
  - Timing-safe comparison
  - **Requirement**: 5.2

### 🛡️ Security Headers

- [ ] **Helmet Middleware**: Security headers configured
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - **Requirement**: 16.8

- [ ] **HSTS**: Strict-Transport-Security header (production)
  - Forces HTTPS connections
  - **Requirement**: 16.8

### 💳 Payment Security

- [ ] **VNPay Signature Verification**: Signatures verified
  - All callbacks verify signature
  - Invalid signatures rejected
  - **Requirement**: 10.5, 10.6, 16.10

- [ ] **Server-Side Verification**: Payment verified server-side
  - Never trust client-side payment data
  - Always verify with VNPay
  - **Requirement**: 10.6

- [ ] **Payment Status Tracking**: Proper status management
  - Pending → Completed/Failed/Expired
  - No duplicate processing
  - **Requirement**: 10.9

### 📧 Email Security

- [ ] **SMTP Authentication**: Proper SMTP credentials
  - Gmail app password (not regular password)
  - Secure connection (TLS)
  - **Requirement**: 13.1, 13.2

- [ ] **Email Content Sanitization**: Email content safe
  - No user input directly in email without sanitization
  - HTML properly escaped
  - **Requirement**: 13.3-13.6

### 🎮 Anti-Cheat Measures

- [ ] **Score Bounds Validation**: Score limits enforced
  - Minimum: 0
  - Maximum: Reasonable value based on game rules
  - **Requirement**: 11.6, 25.1

- [ ] **Duration Validation**: Game duration validated
  - Minimum time to achieve score
  - Suspicious patterns flagged
  - **Requirement**: 25.2

- [ ] **Move Validation**: Optional move list validation
  - Moves stored for verification
  - Suspicious patterns detected
  - **Requirement**: 11.8, 25.3

### 📝 Error Handling

- [ ] **Consistent Error Format**: Errors properly formatted
  - JSON format with code, message, details
  - Appropriate HTTP status codes
  - **Requirement**: 17.1, 17.2

- [ ] **No Sensitive Info in Errors**: Error messages safe
  - No stack traces in production
  - No database errors exposed
  - No internal paths revealed
  - **Requirement**: 17.4

- [ ] **Error Logging**: Errors properly logged
  - All errors logged with stack traces
  - Sensitive data not logged
  - **Requirement**: 17.3

### 🔍 Monitoring & Logging

- [ ] **Security Event Logging**: Important events logged
  - Failed authentication attempts
  - Rate limit violations
  - Invalid token usage
  - Suspicious game scores
  - **Requirement**: 6.5

- [ ] **Request Logging**: HTTP requests logged
  - Morgan middleware configured
  - Logs include timestamp, method, URL, status
  - **Requirement**: 6.5

### 🌍 Environment Configuration

- [ ] **NODE_ENV**: Set to "production" in production
  - Affects error handling
  - Affects logging verbosity
  - **Requirement**: 6.2

- [ ] **.env File**: Not in version control
  - `.env` in `.gitignore`
  - `.env.example` provided
  - **Requirement**: 24.5, 24.6

- [ ] **Environment Variables**: All required vars set
  - Database credentials
  - JWT secrets
  - VNPay credentials
  - SMTP credentials
  - CORS origins
  - **Requirement**: 6.6, 23.7

## Testing Checklist

### 🧪 Security Tests

- [ ] **Run Security Audit**: `npm run security:audit`
  - No critical issues
  - No high severity issues
  - Warnings addressed
  - **Requirement**: 16.1-16.10

- [ ] **Run Security Tests**: `npm run security:test`
  - All authentication tests pass
  - All SQL injection tests pass
  - All validation tests pass
  - **Requirement**: 22.1-22.3

- [ ] **Manual Authentication Testing**: Test auth flows
  - Access without token → 401
  - Access with invalid token → 401
  - Access with expired token → 401
  - Token refresh works
  - **Requirement**: 5.3-5.10

- [ ] **Manual SQL Injection Testing**: Test injection attempts
  - Login field injection → Fails safely
  - Registration field injection → Fails safely
  - Query parameter injection → Fails safely
  - **Requirement**: 16.6

- [ ] **Manual Rate Limit Testing**: Test rate limits
  - Auth endpoints rate limited
  - Payment endpoints rate limited
  - Game submission rate limited
  - **Requirement**: 16.4, 16.5, 25.6

## Deployment Checklist

### 🚀 Pre-Deployment

- [ ] **All Security Tests Pass**: Run all security tests
  - `npm run security:audit` passes
  - `npm run security:test` passes
  - Manual tests completed
  - **Requirement**: 22.1-22.3

- [ ] **Dependencies Updated**: Security patches applied
  - Run `npm audit`
  - Run `npm audit fix`
  - Review and update dependencies
  - **Requirement**: Security best practices

- [ ] **SSL/TLS Configured**: HTTPS enabled
  - Valid SSL certificate
  - HTTP redirects to HTTPS
  - **Requirement**: 16.8

- [ ] **Firewall Configured**: Network security enabled
  - Only necessary ports open
  - Database not publicly accessible
  - **Requirement**: Security best practices

- [ ] **Database Backups**: Backup strategy in place
  - Regular automated backups
  - Backup restoration tested
  - **Requirement**: 24.1-24.6

### 📊 Post-Deployment

- [ ] **Monitor Logs**: Check for security events
  - Failed authentication attempts
  - Rate limit violations
  - Unusual patterns
  - **Requirement**: 6.5

- [ ] **Test Production**: Verify security in production
  - Authentication works
  - Rate limiting works
  - HTTPS enforced
  - **Requirement**: 22.1-22.3

- [ ] **Incident Response Plan**: Plan documented
  - Contact information
  - Escalation procedures
  - Recovery procedures
  - **Requirement**: Security best practices

## Quick Commands

```bash
# Run security audit
npm run security:audit

# Run security tests (requires server running)
npm run security:test

# Check for dependency vulnerabilities
npm audit

# Fix dependency vulnerabilities
npm audit fix

# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate strong password
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

## Requirements Coverage

This checklist covers the following security requirements:

- ✅ **5.1-5.10**: Authentication System
- ✅ **10.4-10.6**: VNPay Payment Security
- ✅ **11.6**: Game Score Validation
- ✅ **13.1-13.2**: Email Service Security
- ✅ **16.1-16.10**: All Security Requirements
- ✅ **17.1-17.5**: Error Handling
- ✅ **22.1-22.3**: Testing Requirements
- ✅ **24.1-24.6**: Deployment Preparation
- ✅ **25.1-25.6**: Anti-Cheat Measures

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
