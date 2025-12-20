const { getPool, sql } = require('../config/database');

/**
 * User Repository
 * Handles database operations for users
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.passwordHash - Hashed password
 * @returns {Promise<Object>} - Created user record
 */
async function createUser(userData) {
  try {
    const pool = await getPool();
    
    const query = `
      INSERT INTO Users (Username, Email, PasswordHash)
      OUTPUT INSERTED.Id, INSERTED.Username, INSERTED.Email, 
             INSERTED.IsEmailVerified, INSERTED.CreatedAt, INSERTED.UpdatedAt
      VALUES (@username, @email, @passwordHash)
    `;

    const result = await pool.request()
      .input('username', sql.NVarChar(50), userData.username)
      .input('email', sql.NVarChar(255), userData.email)
      .input('passwordHash', sql.NVarChar(255), userData.passwordHash)
      .query(query);

    return result.recordset[0];
  } catch (error) {
    // Check for unique constraint violations
    if (error.number === 2627 || error.number === 2601) {
      if (error.message.includes('IX_Users_Email')) {
        throw new Error('DUPLICATE_EMAIL');
      }
      if (error.message.includes('IX_Users_Username')) {
        throw new Error('DUPLICATE_USERNAME');
      }
    }
    console.error('Create user error:', error.message);
    throw new Error('Failed to create user');
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - User record or null
 */
async function getUserById(userId) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT Id, Username, Email, PasswordHash, IsEmailVerified, CreatedAt, UpdatedAt
      FROM Users
      WHERE Id = @userId
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Get user by ID error:', error.message);
    throw new Error('Failed to retrieve user');
  }
}

/**
 * Get user by email
 * @param {string} email - Email address
 * @returns {Promise<Object|null>} - User record or null
 */
async function getUserByEmail(email) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT Id, Username, Email, PasswordHash, IsEmailVerified, CreatedAt, UpdatedAt
      FROM Users
      WHERE Email = @email
    `;

    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Get user by email error:', error.message);
    throw new Error('Failed to retrieve user');
  }
}

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} - User record or null
 */
async function getUserByUsername(username) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT Id, Username, Email, PasswordHash, IsEmailVerified, CreatedAt, UpdatedAt
      FROM Users
      WHERE Username = @username
    `;

    const result = await pool.request()
      .input('username', sql.NVarChar(50), username)
      .query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Get user by username error:', error.message);
    throw new Error('Failed to retrieve user');
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated user record
 */
async function updateUser(userId, updates) {
  try {
    const pool = await getPool();
    
    const allowedFields = ['Username', 'Email', 'IsEmailVerified'];
    const setClauses = [];
    const request = pool.request();

    // Build dynamic SET clause
    Object.keys(updates).forEach(key => {
      const dbField = key.charAt(0).toUpperCase() + key.slice(1);
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = @${key}`);
        request.input(key, updates[key]);
      }
    });

    if (setClauses.length === 0) {
      throw new Error('No valid fields to update');
    }

    setClauses.push('UpdatedAt = GETUTCDATE()');

    const query = `
      UPDATE Users
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.Id, INSERTED.Username, INSERTED.Email, 
             INSERTED.IsEmailVerified, INSERTED.CreatedAt, INSERTED.UpdatedAt
      WHERE Id = @userId
    `;

    request.input('userId', sql.UniqueIdentifier, userId);
    const result = await request.query(query);

    return result.recordset[0];
  } catch (error) {
    console.error('Update user error:', error.message);
    throw new Error('Failed to update user');
  }
}

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} newPasswordHash - New hashed password
 * @returns {Promise<boolean>} - True if updated
 */
async function updatePassword(userId, newPasswordHash) {
  try {
    const pool = await getPool();
    
    const query = `
      UPDATE Users
      SET PasswordHash = @passwordHash, UpdatedAt = GETUTCDATE()
      WHERE Id = @userId
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('passwordHash', sql.NVarChar(255), newPasswordHash)
      .query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Update password error:', error.message);
    throw new Error('Failed to update password');
  }
}

/**
 * Check if email exists
 * @param {string} email - Email address
 * @returns {Promise<boolean>} - True if email exists
 */
async function emailExists(email) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT COUNT(*) as count FROM Users WHERE Email = @email
    `;

    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query(query);

    return result.recordset[0].count > 0;
  } catch (error) {
    console.error('Check email exists error:', error.message);
    throw new Error('Failed to check email');
  }
}

/**
 * Check if username exists
 * @param {string} username - Username
 * @returns {Promise<boolean>} - True if username exists
 */
async function usernameExists(username) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT COUNT(*) as count FROM Users WHERE Username = @username
    `;

    const result = await pool.request()
      .input('username', sql.NVarChar(50), username)
      .query(query);

    return result.recordset[0].count > 0;
  } catch (error) {
    console.error('Check username exists error:', error.message);
    throw new Error('Failed to check username');
  }
}

/**
 * Delete user (soft delete by marking as inactive)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if deleted
 */
async function deleteUser(userId) {
  try {
    const pool = await getPool();
    
    // For now, we'll do a hard delete
    // In production, consider soft delete
    const query = `
      DELETE FROM Users WHERE Id = @userId
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Delete user error:', error.message);
    throw new Error('Failed to delete user');
  }
}

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User statistics
 */
async function getUserStatistics(userId) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT 
        COUNT(*) as totalGames,
        ISNULL(MAX(FinalScore), 0) as highestScore,
        ISNULL(AVG(CAST(FinalScore as FLOAT)), 0) as averageScore
      FROM GameSessions
      WHERE UserId = @userId AND EndTime IS NOT NULL
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(query);

    const stats = result.recordset[0];
    
    return {
      totalGames: stats.totalGames,
      highestScore: stats.highestScore,
      averageScore: Math.round(stats.averageScore)
    };
  } catch (error) {
    console.error('Get user statistics error:', error.message);
    // Return default stats if GameSessions table doesn't exist yet
    return {
      totalGames: 0,
      highestScore: 0,
      averageScore: 0
    };
  }
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  updateUser,
  updatePassword,
  emailExists,
  usernameExists,
  deleteUser,
  getUserStatistics
};
