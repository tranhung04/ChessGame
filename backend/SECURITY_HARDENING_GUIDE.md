# Security Hardening Guide

This guide provides instructions for securing the ToolChess backend application for production deployment.

## Security Audit Results

Run the security audit script to check for common security issues:

```bash
node security-audit.js
```

## Critical Security Fixes

### 1. Generate Strong JWT Secrets

**Issue**: Default JWT secrets are weak and predictable.

**Fix**: Generate strong random secrets for production:

```bash
# On Linux/Mac
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# On Windows PowerShell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update `.env`:
```env
JWT_ACCESS_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
```

**Requirements**: Requirements 16.1, 16.2

### 2. Use Strong Database Password

**Issue**: Database password is too weak (123456).

**Fix**: Generate a strong password with:
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, and special characters
- No dictionary words

Example strong password generator:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

Update `.env`:
```env
DB_PASSWORD=<strong-password>
```

**Requirements**: Requirements 16.1

### 3. Configure VNPay Credentials

**Issue**: VNPay credentials are using placeholder values.

**Fix**: 
1. Register for VNPay merchant account at https://vnpay.vn
2. Get your TMN Code and Hash Secret from VNPay dashboard
3. Update `.env`:

```env
VNPAY_TMN_CODE=<your-actual-tmn-code>
VNPAY_HASH_SECRET=<your-actual-hash-secret>
```

For testing, use VNPay sandbox credentials.

**Requirements**: Requirements 10.4, 10.5, 16.10

## Security Configuration Checklist

### ✅ Environment Variables

- [ ] JWT_ACCESS_SECRET: Strong random secret (64+ characters)
- [ ] JWT_REFRESH_SECRET: Strong random secret (64+ characters)
- [ ] DB_PASSWORD: Strong password (16+ characters)
- [ ] VNPAY_TMN_CODE: Valid VNPay merchant code
- [ ] VNPAY_HASH_SECRET: Valid VNPay hash secret
- [ ] SMTP_PASS: Gmail app password (not regular password)
- [ ] CORS_ORIGIN: Specific origins (not wildcard *)

### ✅ CORS Configuration

Current configuration in `src/app.js`:
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
```

**Production**: Set specific origins in `.env`:
```env
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

**Requirements**: Requirements 16.7

### ✅ Rate Limiting

Rate limiters are configured in `src/middleware/rateLimiter.js`:

- **Auth endpoints**: 5 requests/minute (login, register)
- **Payment endpoints**: 3 requests/minute
- **Game submission**: 10 games/hour per user
- **General API**: 100 requests/minute

**Configuration** (`.env`):
```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
PAYMENT_RATE_LIMIT_MAX=3
```

**Requirements**: Requirements 16.4, 16.5, 25.6

### ✅ SQL Injection Prevention

All database queries use parameterized queries via `mssql` library:

```javascript
// ✅ SAFE - Parameterized query
const result = await pool.request()
  .input('email', sql.NVarChar(255), email)
  .query('SELECT * FROM Users WHERE Email = @email');

// ❌ UNSAFE - String concatenation
const query = `SELECT * FROM Users WHERE Email = '${email}'`;
```

**Status**: All repositories use parameterized queries ✅

**Requirements**: Requirements 16.6

### ✅ Input Validation

All endpoints use Joi validation schemas in `src/middleware/validator.js`:

- Email format validation
- Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
- Username alphanumeric validation
- Score bounds validation
- Request body sanitization

**Requirements**: Requirements 16.6, 5.1, 5.2

### ✅ Password Hashing

Passwords are hashed using bcrypt with 12 rounds in `src/services/passwordService.js`:

```javascript
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);
```

**Requirements**: Requirements 5.2, 16.1

### ✅ JWT Token Security

- **Access Token**: 15 minutes expiry
- **Refresh Token**: 30 days expiry, stored in database
- **Token Verification**: Proper signature verification
- **Token Revocation**: Refresh tokens can be revoked

**Requirements**: Requirements 5.5, 5.6, 16.2, 16.3

### ✅ Security Headers

Helmet middleware is configured in `src/app.js`:

```javascript
app.use(helmet());
```

This adds security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)

**Requirements**: Requirements 16.8

## Authentication Bypass Testing

### Test 1: Access Protected Endpoint Without Token

```bash
curl -X GET http://localhost:3000/api/user/me
```

**Expected**: 401 Unauthorized with error code "NO_TOKEN"

### Test 2: Access with Invalid Token

```bash
curl -X GET http://localhost:3000/api/user/me \
  -H "Authorization: Bearer invalid_token"
```

**Expected**: 401 Unauthorized with error code "INVALID_TOKEN"

### Test 3: Access with Expired Token

Generate an expired token and test:

**Expected**: 401 Unauthorized with error code "TOKEN_EXPIRED"

### Test 4: Refresh Token Reuse

Try to use the same refresh token twice:

**Expected**: Second attempt should fail (token already revoked)

## SQL Injection Testing

### Test 1: Email Field Injection

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR 1=1--","password":"test"}'
```

**Expected**: Login fails, no SQL injection occurs

### Test 2: Username Field Injection

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","email":"test@test.com","password":"Test123!@#"}'
```

**Expected**: Validation error or safe handling, no SQL injection

## Rate Limiting Testing

### Test 1: Auth Rate Limit

Send 6 login requests within 1 minute:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done
```

**Expected**: 6th request returns 429 Too Many Requests

### Test 2: Payment Rate Limit

Send 4 payment creation requests within 1 minute:

**Expected**: 4th request returns 429 Too Many Requests

### Test 3: Game Submission Rate Limit

Submit 11 games within 1 hour:

**Expected**: 11th submission returns 429 Too Many Requests

## Production Deployment Checklist

### Before Deployment

- [ ] Run security audit: `node security-audit.js`
- [ ] All secrets generated and configured
- [ ] CORS origins set to production domains
- [ ] Database password changed from default
- [ ] VNPay production credentials configured
- [ ] Gmail SMTP configured with app password
- [ ] NODE_ENV set to "production"
- [ ] DB_ENCRYPT set to "true"
- [ ] Rate limiting configured appropriately
- [ ] Error messages don't expose sensitive info

### After Deployment

- [ ] Test authentication flow
- [ ] Test rate limiting
- [ ] Test SQL injection prevention
- [ ] Monitor logs for suspicious activity
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring and alerting

## Security Monitoring

### Log Monitoring

Monitor logs for:
- Failed authentication attempts
- Rate limit violations
- SQL errors
- Unusual API patterns
- Payment failures

### Metrics to Track

- Failed login attempts per IP
- Rate limit hits
- Token refresh frequency
- Payment success/failure rates
- Game submission patterns

## Incident Response

### If Security Breach Detected

1. **Immediate Actions**:
   - Rotate all secrets (JWT, database, VNPay)
   - Revoke all refresh tokens
   - Review access logs
   - Identify affected users

2. **Investigation**:
   - Analyze logs for breach timeline
   - Identify vulnerability exploited
   - Assess data exposure

3. **Remediation**:
   - Patch vulnerability
   - Notify affected users
   - Update security measures
   - Document incident

## Additional Security Recommendations

### 1. API Rate Limiting by IP

Consider adding IP-based rate limiting for additional protection:

```javascript
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per IP
  keyGenerator: (req) => req.ip
});
```

### 2. Request Size Limits

Add request size limits to prevent DoS attacks:

```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### 3. Security Logging

Log security events:
- Failed authentication attempts
- Rate limit violations
- Invalid token usage
- Suspicious game scores

### 4. Database Connection Security

- Use connection pooling (already configured)
- Enable SSL/TLS for database connections in production
- Use least privilege database user
- Regular security updates

### 5. Dependency Security

Regularly update dependencies:

```bash
npm audit
npm audit fix
```

### 6. Content Security Policy

Consider adding CSP headers for additional protection:

```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));
```

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Express Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html

## Requirements Coverage

This security hardening addresses the following requirements:

- **16.1**: Password hashing with bcrypt (12 rounds) ✅
- **16.2**: Short-lived access tokens (15 minutes) ✅
- **16.3**: Long-lived refresh tokens (30 days) in database ✅
- **16.4**: Rate limiting on auth endpoints (5 req/min) ✅
- **16.5**: Rate limiting on payment endpoints (3 req/min) ✅
- **16.6**: Input validation and sanitization ✅
- **16.7**: CORS configuration ✅
- **16.8**: Helmet security headers ✅
- **16.9**: Secure token storage (expo-secure-store on mobile) ✅
- **16.10**: VNPay signature verification ✅
