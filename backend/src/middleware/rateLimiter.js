const rateLimit = require('express-rate-limit');

/**
 * Create a custom rate limiter
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Rate limiter middleware
 */
function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 60000, // 1 minute
    max: 100,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests, please try again later'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  };

  return rateLimit({ ...defaultOptions, ...options });
}

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth endpoints rate limiter (stricter)
 */
const authLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

/**
 * Payment endpoints rate limiter (very strict)
 */
const paymentLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX) || 3,
  message: {
    success: false,
    error: {
      code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
      message: 'Too many payment requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

/**
 * Game submission rate limiter
 */
const gameSubmitLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      code: 'GAME_RATE_LIMIT_EXCEEDED',
      message: 'Too many game submissions, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID from JWT token if available
    return req.user?.userId || req.ip;
  }
});

module.exports = {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  paymentLimiter,
  gameSubmitLimiter
};
