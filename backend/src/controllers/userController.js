const userRepository = require('../repositories/userRepository');

/**
 * User Controller
 * Handles user profile management endpoints
 */

/**
 * Get current user profile
 * @route GET /api/user/me
 * @access Private
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.userId;

    // Get user data
    const user = await userRepository.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get user statistics
    const stats = await userRepository.getUserStatistics(userId);

    // Get premium status (will be implemented in premium module)
    // For now, return default premium status
    const premium = {
      isActive: false,
      package: null,
      scoreBonus: 0,
      revivesLeft: 0,
      expiresAt: null
    };

    // Remove sensitive data
    const { PasswordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        id: userWithoutPassword.Id,
        username: userWithoutPassword.Username,
        email: userWithoutPassword.Email,
        isEmailVerified: userWithoutPassword.IsEmailVerified,
        createdAt: userWithoutPassword.CreatedAt,
        stats,
        premium
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    next(error);
  }
}

/**
 * Update current user profile
 * @route PUT /api/user/me
 * @access Private
 */
async function updateMe(req, res, next) {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    // Validate input
    const updates = {};
    
    if (username !== undefined) {
      if (!username || username.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username cannot be empty',
            details: { field: 'username' },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username must be between 3 and 50 characters',
            details: { field: 'username' },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      updates.username = username.trim();
    }

    if (email !== undefined) {
      if (!email || email.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email cannot be empty',
            details: { field: 'email' },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Invalid email format',
            details: { field: 'email' },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      updates.email = email.trim().toLowerCase();
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No valid fields to update',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update user
    try {
      const updatedUser = await userRepository.updateUser(userId, updates);
      
      // Remove sensitive data
      const { PasswordHash, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        data: {
          id: userWithoutPassword.Id,
          username: userWithoutPassword.Username,
          email: userWithoutPassword.Email,
          isEmailVerified: userWithoutPassword.IsEmailVerified,
          createdAt: userWithoutPassword.CreatedAt,
          updatedAt: userWithoutPassword.UpdatedAt
        }
      });
    } catch (error) {
      // Handle duplicate errors
      if (error.message === 'DUPLICATE_EMAIL') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Email already exists',
            details: { field: 'email' },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      if (error.message === 'DUPLICATE_USERNAME') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_USERNAME',
            message: 'Username already exists',
            details: { field: 'username' },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Update me error:', error);
    next(error);
  }
}

module.exports = {
  getMe,
  updateMe
};
