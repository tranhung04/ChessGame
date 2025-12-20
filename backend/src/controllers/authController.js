const authService = require('../services/authService');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username, email, and password are required',
          details: {
            username: !username ? 'Username is required' : null,
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null
          }
        }
      });
    }

    // Get device info and IP
    const deviceInfo = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    // Register user
    const result = await authService.register(
      { username, email, password },
      deviceInfo,
      ipAddress
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    // Handle specific errors
    if (error.message === 'INVALID_EMAIL') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format',
          details: { field: 'email' }
        }
      });
    }

    if (error.message === 'WEAK_PASSWORD') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password does not meet requirements',
          details: { errors: error.details }
        }
      });
    }

    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already registered',
          details: { field: 'email' }
        }
      });
    }

    if (error.message === 'DUPLICATE_USERNAME') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_USERNAME',
          message: 'Username already taken',
          details: { field: 'username' }
        }
      });
    }

    next(error);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          details: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null
          }
        }
      });
    }

    // Get device info and IP
    const deviceInfo = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    // Login user
    const result = await authService.login(email, password, deviceInfo, ipAddress);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    next(error);
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    // Validate required fields
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
          details: { field: 'refreshToken' }
        }
      });
    }

    // Get device info and IP
    const deviceInfo = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    // Refresh token
    const result = await authService.refreshAccessToken(refreshToken, deviceInfo, ipAddress);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'INVALID_REFRESH_TOKEN' || 
        error.message === 'REFRESH_TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: {
          code: error.message,
          message: 'Refresh token is invalid or expired'
        }
      });
    }

    next(error);
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    // Logout (revoke refresh token)
    await authService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
async function logoutAll(req, res, next) {
  try {
    const userId = req.user.userId; // From auth middleware

    const count = await authService.logoutAllDevices(userId);

    res.status(200).json({
      success: true,
      message: `Logged out from ${count} device(s)`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login with Google
 * POST /api/auth/google
 */
async function loginWithGoogle(req, res, next) {
  try {
    const { idToken } = req.body;

    // Validate idToken
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Google ID token is required'
        }
      });
    }

    // Get device info and IP
    const deviceInfo = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    // Verify Google token and login/register user
    const result = await authService.loginWithGoogle(
      idToken,
      deviceInfo,
      ipAddress
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'INVALID_GOOGLE_TOKEN') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_GOOGLE_TOKEN',
          message: 'Google token không hợp lệ hoặc đã hết hạn'
        }
      });
    }

    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  loginWithGoogle
};
