# Middleware Documentation

This directory contains all Express middleware used in the ToolChess Backend API.

## Available Middleware

### 1. Error Handler (`errorHandler.js`)

Centralized error handling middleware that formats all errors into consistent JSON responses.

**Usage:**
```javascript
const { errorHandler, createError } = require('./middleware/errorHandler');

// In app.js (must be last middleware)
app.use(errorHandler);

// In controllers
throw createError.badRequest('Invalid input');
throw createError.unauthorized('Not authenticated');
throw createError.notFound('User not found');
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

**Available Error Creators:**
- `createError.badRequest(message, details)` - 400
- `createError.unauthorized(message, details)` - 401
- `createError.forbidden(message, details)` - 403
- `createError.notFound(message, details)` - 404
- `createError.conflict(message, details)` - 409
- `createError.validationError(message, details)` - 400
- `createError.internalError(message, details)` - 500
- `createError.tokenExpired(message, details)` - 401
- `createError.invalidToken(message, details)` - 401

### 2. Not Found Handler (`notFoundHandler.js`)

Catches all requests that don't match any routes and returns 404 error.

**Usage:**
```javascript
const { notFoundHandler } = require('./middleware/notFoundHandler');

// In app.js (before error handler)
app.use(notFoundHandler);
```

### 3. Rate Limiter (`rateLimiter.js`)

Implements rate limiting for different endpoint types.

**Usage:**
```javascript
const { 
  generalLimiter, 
  authLimiter, 
  paymentLimiter,
  gameSubmitLimiter 
} = require('./middleware/rateLimiter');

// Apply to specific routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/payment', paymentLimiter);
app.use('/api/game/submit', gameSubmitLimiter);

// Or apply globally
app.use('/api', generalLimiter);
```

**Rate Limits:**
- `generalLimiter`: 100 requests/minute
- `authLimiter`: 5 requests/minute
- `paymentLimiter`: 3 requests/minute
- `gameSubmitLimiter`: 10 requests/hour

### 4. Request Logger (`requestLogger.js`)

Custom request logging middleware that logs request and response information.

**Usage:**
```javascript
const { requestLogger } = require('./middleware/requestLogger');

// In app.js
app.use(requestLogger);
```

**Log Format:**
```
→ GET /api/user/me { ip: '::1', userAgent: '...', timestamp: '...' }
← GET /api/user/me 200 45ms
```

### 5. Validator (`validator.js`)

Input validation middleware using Joi schemas.

**Usage:**
```javascript
const { validate, schemas } = require('./middleware/validator');

// In routes
router.post('/register', 
  validate(schemas.register, 'body'),
  authController.register
);

router.get('/history',
  validate(schemas.pagination, 'query'),
  gameController.getHistory
);
```

**Available Schemas:**
- `schemas.register` - User registration
- `schemas.login` - User login
- `schemas.refreshToken` - Token refresh
- `schemas.updateProfile` - Profile update
- `schemas.subscribe` - Premium subscription
- `schemas.createPayment` - Payment creation
- `schemas.startGame` - Start game session
- `schemas.submitGame` - Submit game score
- `schemas.pagination` - Pagination query
- `schemas.leaderboard` - Leaderboard query

**Custom Schema Example:**
```javascript
const Joi = require('joi');
const { validate } = require('./middleware/validator');

const customSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(0).required()
});

router.post('/custom', 
  validate(customSchema, 'body'),
  controller.handler
);
```

### 6. Authentication (`auth.js`)

JWT token verification middleware.

**Usage:**
```javascript
const { authenticate, optionalAuthenticate } = require('./middleware/auth');

// Require authentication
router.get('/profile', authenticate, userController.getProfile);

// Optional authentication (user info attached if token present)
router.get('/leaderboard', optionalAuthenticate, gameController.getLeaderboard);
```

**Attached User Object:**
```javascript
req.user = {
  id: 'user-uuid',
  username: 'player123',
  email: 'player@example.com'
};
```

## Middleware Order

The order of middleware in `app.js` is important:

```javascript
// 1. Security (helmet)
app.use(helmet());

// 2. CORS
app.use(cors(corsOptions));

// 3. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request logging
app.use(requestLogger);

// 5. Rate limiting (optional, can be per-route)
app.use('/api', generalLimiter);

// 6. Routes with authentication and validation
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticate, userRoutes);

// 7. 404 handler
app.use(notFoundHandler);

// 8. Error handler (MUST BE LAST)
app.use(errorHandler);
```

## Creating Custom Middleware

Example of creating custom middleware:

```javascript
function myMiddleware(req, res, next) {
  // Do something with request
  console.log('Processing request...');
  
  // Modify request
  req.customProperty = 'value';
  
  // Continue to next middleware
  next();
  
  // Or send error to error handler
  // next(createError.badRequest('Something went wrong'));
  
  // Or send response directly
  // res.json({ success: true });
}

module.exports = { myMiddleware };
```

## Error Handling in Middleware

Always use `next(error)` to pass errors to the error handler:

```javascript
function myMiddleware(req, res, next) {
  try {
    // Your logic here
    if (somethingWrong) {
      throw createError.badRequest('Invalid input');
    }
    next();
  } catch (error) {
    next(error);
  }
}

// For async middleware
async function myAsyncMiddleware(req, res, next) {
  try {
    await someAsyncOperation();
    next();
  } catch (error) {
    next(error);
  }
}
```

## Testing Middleware

Example test for middleware:

```javascript
const request = require('supertest');
const app = require('../app');

describe('Authentication Middleware', () => {
  it('should reject requests without token', async () => {
    const response = await request(app)
      .get('/api/user/me')
      .expect(401);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should accept requests with valid token', async () => {
    const token = 'valid-jwt-token';
    
    const response = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```
