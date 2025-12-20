const Joi = require('joi');
const { createError } = require('./errorHandler');

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const details = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message;
        return acc;
      }, {});

      return next(createError.validationError('Validation failed', details));
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
}

/**
 * Common validation schemas
 */
const schemas = {
  // User registration
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 50 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      })
  }),

  // User login
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  }),

  // Update profile
  updateProfile: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(50)
      .optional(),
    email: Joi.string()
      .email()
      .optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // Premium subscription
  subscribe: Joi.object({
    packageId: Joi.string()
      .required()
      .messages({
        'any.required': 'Package ID is required'
      }),
    paymentId: Joi.string()
      .required()
      .messages({
        'any.required': 'Payment ID is required'
      })
  }),

  // Create payment
  createPayment: Joi.object({
    packageId: Joi.string()
      .required()
      .messages({
        'any.required': 'Package ID is required'
      }),
    returnUrl: Joi.string()
      .uri()
      .optional()
  }),

  // Start game
  startGame: Joi.object({
    mode: Joi.string()
      .valid('normal', 'premium')
      .default('normal')
      .messages({
        'any.only': 'Mode must be either "normal" or "premium"'
      })
  }),

  // Submit game
  submitGame: Joi.object({
    sessionId: Joi.string()
      .required()
      .messages({
        'any.required': 'Session ID is required'
      }),
    score: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Score must be a number',
        'number.integer': 'Score must be an integer',
        'number.min': 'Score cannot be negative',
        'any.required': 'Score is required'
      }),
    turnCount: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Turn count must be a number',
        'number.integer': 'Turn count must be an integer',
        'number.min': 'Turn count cannot be negative',
        'any.required': 'Turn count is required'
      }),
    duration: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Duration must be a number',
        'number.integer': 'Duration must be an integer',
        'number.min': 'Duration cannot be negative',
        'any.required': 'Duration is required'
      }),
    moves: Joi.array()
      .items(Joi.object({
        from: Joi.array().items(Joi.number()).length(2).required(),
        to: Joi.array().items(Joi.number()).length(2).required(),
        captured: Joi.string().allow(null).optional()
      }))
      .optional()
  }),

  // Pagination query
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
  }),

  // Leaderboard query
  leaderboard: Joi.object({
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(100),
    period: Joi.string()
      .valid('all', 'daily', 'weekly', 'monthly')
      .default('all')
  })
};

module.exports = {
  validate,
  schemas
};
