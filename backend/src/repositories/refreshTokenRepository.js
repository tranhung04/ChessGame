const { getPool, sql } = require('../config/database');

/**
 * RefreshToken Repository
 * Handles database operations for refresh tokens
 */

/**
 * Store refresh token in database
 * @param {Object} tokenData - Token data
 * @param {string} tokenData.userId - User ID
 * @param {string} tokenData.token - Refresh token string
 * @param {string} tokenData.tokenId - Unique token ID
 * @param {string} tokenData.deviceInfo - Device information
 * @param {string} tokenData.ipAddress - IP address
 * @param {Date} tokenData.expiresAt - Expiration date
 * @returns {Promise<Object>} - Created token record
 */
async function storeRefreshToken(tokenData) {
  try {
    const pool = await getPool();
    
    const query = `
      INSERT INTO RefreshTokens (UserId, Token, DeviceInfo, IpAddress, ExpiresAt)
      OUTPUT INSERTED.*
      VALUES (@userId, @token, @deviceInfo, @ipAddress, @expiresAt)
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, tokenData.userId)
      .input('token', sql.NVarChar(500), tokenData.token)
      .input('deviceInfo', sql.NVarChar(500), tokenData.deviceInfo || null)
      .input('ipAddress', sql.NVarChar(50), tokenData.ipAddress || null)
      .input('expiresAt', sql.DateTime2, tokenData.expiresAt)
      .query(query);

    return result.recordset[0];
  } catch (error) {
    console.error('Store refresh token error:', error.message);
    throw new Error('Failed to store refresh token');
  }
}

/**
 * Retrieve refresh token by token string
 * @param {string} token - Refresh token string
 * @returns {Promise<Object|null>} - Token record or null if not found
 */
async function getRefreshTokenByToken(token) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT * FROM RefreshTokens
      WHERE Token = @token
        AND RevokedAt IS NULL
        AND ExpiresAt > GETUTCDATE()
    `;

    const result = await pool.request()
      .input('token', sql.NVarChar(500), token)
      .query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Get refresh token error:', error.message);
    throw new Error('Failed to retrieve refresh token');
  }
}

/**
 * Retrieve all active refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of token records
 */
async function getActiveTokensByUserId(userId) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT * FROM RefreshTokens
      WHERE UserId = @userId
        AND RevokedAt IS NULL
        AND ExpiresAt > GETUTCDATE()
      ORDER BY CreatedAt DESC
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Get active tokens error:', error.message);
    throw new Error('Failed to retrieve active tokens');
  }
}

/**
 * Revoke a specific refresh token
 * @param {string} token - Refresh token string
 * @returns {Promise<boolean>} - True if token was revoked
 */
async function revokeRefreshToken(token) {
  try {
    const pool = await getPool();
    
    const query = `
      UPDATE RefreshTokens
      SET RevokedAt = GETUTCDATE()
      WHERE Token = @token
        AND RevokedAt IS NULL
    `;

    const result = await pool.request()
      .input('token', sql.NVarChar(500), token)
      .query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Revoke refresh token error:', error.message);
    throw new Error('Failed to revoke refresh token');
  }
}

/**
 * Revoke all refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of tokens revoked
 */
async function revokeAllUserTokens(userId) {
  try {
    const pool = await getPool();
    
    const query = `
      UPDATE RefreshTokens
      SET RevokedAt = GETUTCDATE()
      WHERE UserId = @userId
        AND RevokedAt IS NULL
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(query);

    return result.rowsAffected[0];
  } catch (error) {
    console.error('Revoke all user tokens error:', error.message);
    throw new Error('Failed to revoke user tokens');
  }
}

/**
 * Clean up expired tokens
 * Removes tokens that have expired
 * @returns {Promise<number>} - Number of tokens deleted
 */
async function cleanupExpiredTokens() {
  try {
    const pool = await getPool();
    
    const query = `
      DELETE FROM RefreshTokens
      WHERE ExpiresAt < GETUTCDATE()
        OR RevokedAt < DATEADD(day, -30, GETUTCDATE())
    `;

    const result = await pool.request().query(query);

    const deletedCount = result.rowsAffected[0];
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired refresh tokens`);
    }

    return deletedCount;
  } catch (error) {
    console.error('Cleanup expired tokens error:', error.message);
    throw new Error('Failed to cleanup expired tokens');
  }
}

/**
 * Get token count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of active tokens
 */
async function getTokenCountByUserId(userId) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT COUNT(*) as count FROM RefreshTokens
      WHERE UserId = @userId
        AND RevokedAt IS NULL
        AND ExpiresAt > GETUTCDATE()
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(query);

    return result.recordset[0].count;
  } catch (error) {
    console.error('Get token count error:', error.message);
    throw new Error('Failed to get token count');
  }
}

/**
 * Check if token exists and is valid
 * @param {string} token - Refresh token string
 * @returns {Promise<boolean>} - True if token is valid
 */
async function isTokenValid(token) {
  try {
    const tokenRecord = await getRefreshTokenByToken(token);
    return tokenRecord !== null;
  } catch (error) {
    console.error('Check token validity error:', error.message);
    return false;
  }
}

module.exports = {
  storeRefreshToken,
  getRefreshTokenByToken,
  getActiveTokensByUserId,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  getTokenCountByUserId,
  isTokenValid
};
