const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Token Service
 * Handles JWT token generation, verification, and decoding
 */

// Token expiry times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

// Get secrets from environment variables
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production';

/**
 * Generate access token (short-lived)
 * @param {Object} payload - Token payload { userId, username, email }
 * @returns {string} - JWT access token
 */
function generateAccessToken(payload) {
  try {
    if (!payload.userId) {
      throw new Error('userId is required in token payload');
    }

    const tokenPayload = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      type: 'access'
    };

    const token = jwt.sign(tokenPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'toolchess-api',
      audience: 'toolchess-app'
    });

    return token;
  } catch (error) {
    console.error('Access token generation error:', error.message);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - Token payload { userId, tokenId }
 * @returns {string} - JWT refresh token
 */
function generateRefreshToken(payload) {
  try {
    if (!payload.userId) {
      throw new Error('userId is required in token payload');
    }

    // Generate unique token ID if not provided
    const tokenId = payload.tokenId || crypto.randomBytes(32).toString('hex');

    const tokenPayload = {
      userId: payload.userId,
      tokenId: tokenId,
      type: 'refresh'
    };

    const token = jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'toolchess-api',
      audience: 'toolchess-app'
    });

    return { token, tokenId };
  } catch (error) {
    console.error('Refresh token generation error:', error.message);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Verify and decode access token
 * @param {string} token - JWT access token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'toolchess-api',
      audience: 'toolchess-app'
    });

    // Verify token type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_TOKEN');
    }
    throw error;
  }
}

/**
 * Verify and decode refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'toolchess-api',
      audience: 'toolchess-app'
    });

    // Verify token type
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Token decode error:', error.message);
    return null;
  }
}

/**
 * Get token expiry time in seconds
 * @param {string} token - JWT token
 * @returns {number|null} - Expiry timestamp or null
 */
function getTokenExpiry(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
function isTokenExpired(token) {
  try {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;

    const now = Math.floor(Date.now() / 1000);
    return now >= expiry;
  } catch (error) {
    return true;
  }
}

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object { id, username, email }
 * @returns {Object} - { accessToken, refreshToken, tokenId }
 */
function generateTokenPair(user) {
  try {
    const accessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    const { token: refreshToken, tokenId } = generateRefreshToken({
      userId: user.id
    });

    return {
      accessToken,
      refreshToken,
      tokenId
    };
  } catch (error) {
    console.error('Token pair generation error:', error.message);
    throw new Error('Failed to generate token pair');
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
  isTokenExpired,
  generateTokenPair,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
};
