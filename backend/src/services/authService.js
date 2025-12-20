const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const passwordService = require('./passwordService');
const tokenService = require('./tokenService');

/**
 * Authentication Service
 * Handles authentication business logic
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Plain text password
 * @param {string} deviceInfo - Device information
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} - { user, tokens }
 */
async function register(userData, deviceInfo = null, ipAddress = null) {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('INVALID_EMAIL');
    }

    // Validate password strength
    const passwordValidation = passwordService.validatePasswordStrength(userData.password);
    if (!passwordValidation.valid) {
      const error = new Error('WEAK_PASSWORD');
      error.details = passwordValidation.errors;
      throw error;
    }

    // Check if email already exists
    const emailExists = await userRepository.emailExists(userData.email);
    if (emailExists) {
      throw new Error('DUPLICATE_EMAIL');
    }

    // Check if username already exists
    const usernameExists = await userRepository.usernameExists(userData.username);
    if (usernameExists) {
      throw new Error('DUPLICATE_USERNAME');
    }

    // Hash password
    const passwordHash = await passwordService.hashPassword(userData.password);

    // Create user
    const user = await userRepository.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash
    });

    // Generate tokens
    const { accessToken, refreshToken, tokenId } = tokenService.generateTokenPair({
      id: user.Id,
      username: user.Username,
      email: user.Email
    });

    // Calculate token expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Store refresh token
    await refreshTokenRepository.storeRefreshToken({
      userId: user.Id,
      token: refreshToken,
      tokenId: tokenId,
      deviceInfo: deviceInfo,
      ipAddress: ipAddress,
      expiresAt: expiresAt
    });

    // Return user without password hash
    const { PasswordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  } catch (error) {
    console.error('Registration error:', error.message);
    throw error;
  }
}

/**
 * Login user
 * @param {string} email - Email
 * @param {string} password - Plain text password
 * @param {string} deviceInfo - Device information
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} - { user, tokens }
 */
async function login(email, password, deviceInfo = null, ipAddress = null) {
  try {
    // Get user by email
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await passwordService.verifyPassword(password, user.PasswordHash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check if password needs rehashing (if salt rounds changed)
    if (passwordService.needsRehash(user.PasswordHash)) {
      const newHash = await passwordService.hashPassword(password);
      await userRepository.updatePassword(user.Id, newHash);
    }

    // Generate tokens
    const { accessToken, refreshToken, tokenId } = tokenService.generateTokenPair({
      id: user.Id,
      username: user.Username,
      email: user.Email
    });

    // Calculate token expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Store refresh token
    await refreshTokenRepository.storeRefreshToken({
      userId: user.Id,
      token: refreshToken,
      tokenId: tokenId,
      deviceInfo: deviceInfo,
      ipAddress: ipAddress,
      expiresAt: expiresAt
    });

    // Return user without password hash
    const { PasswordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @param {string} deviceInfo - Device information
 * @param {string} ipAddress - IP address
 * @returns {Promise<Object>} - { accessToken, refreshToken }
 */
async function refreshAccessToken(refreshToken, deviceInfo = null, ipAddress = null) {
  try {
    // Verify refresh token JWT
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    // Check if token exists in database and is not revoked
    const tokenRecord = await refreshTokenRepository.getRefreshTokenByToken(refreshToken);
    if (!tokenRecord) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Get user
    const user = await userRepository.getUserById(decoded.userId);
    if (!user) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Revoke old refresh token
    await refreshTokenRepository.revokeRefreshToken(refreshToken);

    // Generate new token pair
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, tokenId } = 
      tokenService.generateTokenPair({
        id: user.Id,
        username: user.Username,
        email: user.Email
      });

    // Calculate token expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Store new refresh token
    await refreshTokenRepository.storeRefreshToken({
      userId: user.Id,
      token: newRefreshToken,
      tokenId: tokenId,
      deviceInfo: deviceInfo,
      ipAddress: ipAddress,
      expiresAt: expiresAt
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    console.error('Refresh token error:', error.message);
    throw error;
  }
}

/**
 * Logout user
 * @param {string} refreshToken - Refresh token to revoke
 * @returns {Promise<boolean>} - True if logout successful
 */
async function logout(refreshToken) {
  try {
    if (!refreshToken) {
      return true; // Already logged out
    }

    // Revoke refresh token
    const revoked = await refreshTokenRepository.revokeRefreshToken(refreshToken);
    return revoked;
  } catch (error) {
    console.error('Logout error:', error.message);
    throw error;
  }
}

/**
 * Logout from all devices
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of tokens revoked
 */
async function logoutAllDevices(userId) {
  try {
    const count = await refreshTokenRepository.revokeAllUserTokens(userId);
    return count;
  } catch (error) {
    console.error('Logout all devices error:', error.message);
    throw error;
  }
}

/**
 * Verify access token
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} - Decoded token payload
 */
async function verifyAccessToken(accessToken) {
  try {
    const decoded = tokenService.verifyAccessToken(accessToken);
    return decoded;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAllDevices,
  verifyAccessToken
};


/**
 * Login or register user with Google
 * @param {string} idToken - Google ID token
 * @param {string} deviceInfo - Device information
 * @param {string} ipAddress - IP address
 * @returns {Promise<{user: object, tokens: object}>}
 */
async function loginWithGoogle(idToken, deviceInfo, ipAddress) {
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      throw new Error('INVALID_GOOGLE_TOKEN');
    }

    // Check if user exists
    let user = await userRepository.findByEmail(email);

    if (!user) {
      // Create new user with Google info
      user = await userRepository.create({
        username: name || email.split('@')[0],
        email,
        passwordHash: null, // No password for Google users
        googleId,
        avatar: picture,
        isEmailVerified: true
      });
    } else {
      // Update Google ID if not set
      if (!user.GoogleId) {
        await userRepository.update(user.Id, {
          googleId,
          avatar: picture || user.Avatar
        });
        user.GoogleId = googleId;
      }
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken({
      userId: user.Id,
      username: user.Username,
      email: user.Email
    });

    const refreshToken = tokenService.generateRefreshToken({
      userId: user.Id
    });

    // Store refresh token
    await refreshTokenRepository.create({
      userId: user.Id,
      token: refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return {
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email,
        avatar: user.Avatar || picture,
        createdAt: user.CreatedAt
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  } catch (error) {
    console.error('Google login error:', error);
    throw new Error('INVALID_GOOGLE_TOKEN');
  }
}

module.exports = {
  register,
  login,
  refreshToken: refreshAccessToken,
  logout,
  logoutAllDevices,
  verifyAccessToken,
  loginWithGoogle
};
