/**
 * Centralized error handling middleware
 * Formats all errors into consistent JSON response
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Default error response
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || {}
    }
  };

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    // Remove stack trace and sensitive details
    if (errorResponse.error.code === 'INTERNAL_SERVER_ERROR') {
      errorResponse.error.message = 'An unexpected error occurred';
      errorResponse.error.details = {};
    }
  } else {
    // Include stack trace in development
    errorResponse.error.stack = err.stack;
  }

  // Determine HTTP status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Create custom error with code and status
 */
class AppError extends Error {
  constructor(message, code, statusCode = 500, details = {}) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error creators
 */
const createError = {
  badRequest: (message, details = {}) => 
    new AppError(message, 'BAD_REQUEST', 400, details),
  
  unauthorized: (message = 'Unauthorized', details = {}) => 
    new AppError(message, 'UNAUTHORIZED', 401, details),
  
  forbidden: (message = 'Forbidden', details = {}) => 
    new AppError(message, 'FORBIDDEN', 403, details),
  
  notFound: (message = 'Resource not found', details = {}) => 
    new AppError(message, 'NOT_FOUND', 404, details),
  
  conflict: (message, details = {}) => 
    new AppError(message, 'CONFLICT', 409, details),
  
  validationError: (message, details = {}) => 
    new AppError(message, 'VALIDATION_ERROR', 400, details),
  
  internalError: (message = 'Internal server error', details = {}) => 
    new AppError(message, 'INTERNAL_SERVER_ERROR', 500, details),
  
  tokenExpired: (message = 'Token expired', details = {}) => 
    new AppError(message, 'TOKEN_EXPIRED', 401, details),
  
  invalidToken: (message = 'Invalid token', details = {}) => 
    new AppError(message, 'INVALID_TOKEN', 401, details)
};

module.exports = {
  errorHandler,
  AppError,
  createError
};
