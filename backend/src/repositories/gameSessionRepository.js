const { getPool, sql } = require('../config/database');

/**
 * GameSession Repository
 * Handles database operations for game sessions
 */

/**
 * Create a new game session
 * @param {Object} sessionData - Session data
 * @param {string} sessionData.userId - User ID
 * @param {string} sessionData.mode - Game mode (normal, premium)
 * @param {number} sessionData.premiumApplied - Whether premium is applied (0 or 1)
 * @param {number} sessionData.scoreBonus - Score bonus percentage (0-1)
 * @returns {Promise<Object>} - Created session record
 */
async function createGameSession(sessionData) {
  try {
    const pool = await getPool();
    
    const query = `
      INSERT INTO GameSessions (UserId, Mode, StartTime, PremiumApplied, ScoreBonus)
      OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.Mode, INSERTED.StartTime,
             INSERTED.EndTime, INSERTED.Score, INSERTED.TurnCount, INSERTED.Duration,
             INSERTED.PremiumApplied, INSERTED.ScoreBonus, INSERTED.FinalScore,
             INSERTED.Metadata, INSERTED.CreatedAt, INSERTED.UpdatedAt
      VALUES (@userId, @mode, GETUTCDATE(), @premiumApplied, @scoreBonus)
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, sessionData.userId)
      .input('mode', sql.NVarChar(20), sessionData.mode)
      .input('premiumApplied', sql.Bit, sessionData.premiumApplied || 0)
      .input('scoreBonus', sql.Decimal(3, 2), sessionData.scoreBonus || 0)
      .query(query);

    return result.recordset[0];
  } catch (error) {
    console.error('Create game session error:', error.message);
    throw new Error('Failed to create game session');
  }
}

/**
 * Update game session
 * @param {string} sessionId - Session ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated session record
 */
async function updateGameSession(sessionId, updates) {
  try {
    const pool = await getPool();
    
    const allowedFields = {
      'endTime': 'EndTime',
      'score': 'Score',
      'turnCount': 'TurnCount',
      'duration': 'Duration',
      'finalScore': 'FinalScore',
      'metadata': 'Metadata'
    };
    
    const setClauses = [];
    const request = pool.request();

    // Build dynamic SET clause
    Object.keys(updates).forEach(key => {
      const dbField = allowedFields[key];
      if (dbField) {
        setClauses.push(`${dbField} = @${key}`);
        
        // Handle different data types
        if (key === 'endTime') {
          request.input(key, sql.DateTime2, updates[key]);
        } else if (key === 'metadata') {
          request.input(key, sql.NVarChar(sql.MAX), updates[key]);
        } else {
          request.input(key, sql.Int, updates[key]);
        }
      }
    });

    if (setClauses.length === 0) {
      throw new Error('No valid fields to update');
    }

    setClauses.push('UpdatedAt = GETUTCDATE()');

    const query = `
      UPDATE GameSessions
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.Mode, INSERTED.StartTime,
             INSERTED.EndTime, INSERTED.Score, INSERTED.TurnCount, INSERTED.Duration,
             INSERTED.PremiumApplied, INSERTED.ScoreBonus, INSERTED.FinalScore,
             INSERTED.Metadata, INSERTED.CreatedAt, INSERTED.UpdatedAt
      WHERE Id = @sessionId
    `;

    request.input('sessionId', sql.UniqueIdentifier, sessionId);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      throw new Error('SESSION_NOT_FOUND');
    }

    return result.recordset[0];
  } catch (error) {
    if (error.message === 'SESSION_NOT_FOUND') {
      throw error;
    }
    console.error('Update game session error:', error.message);
    throw new Error('Failed to update game session');
  }
}

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} - Session record or null
 */
async function getSessionById(sessionId) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT Id, UserId, Mode, StartTime, EndTime, Score, TurnCount, Duration,
             PremiumApplied, ScoreBonus, FinalScore, Metadata, CreatedAt, UpdatedAt
      FROM GameSessions
      WHERE Id = @sessionId
    `;

    const result = await pool.request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Get session by ID error:', error.message);
    throw new Error('Failed to retrieve session');
  }
}

/**
 * Get user game history
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @returns {Promise<Object>} - Sessions and pagination info
 */
async function getUserGameHistory(userId, options = {}) {
  try {
    const pool = await getPool();
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM GameSessions
      WHERE UserId = @userId AND EndTime IS NOT NULL
    `;

    const countResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(countQuery);

    const total = countResult.recordset[0].total;

    // Get paginated sessions
    const query = `
      SELECT Id, UserId, Mode, StartTime, EndTime, Score, TurnCount, Duration,
             PremiumApplied, ScoreBonus, FinalScore, Metadata, CreatedAt, UpdatedAt
      FROM GameSessions
      WHERE UserId = @userId AND EndTime IS NOT NULL
      ORDER BY CreatedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(query);

    return {
      sessions: result.recordset,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Get user game history error:', error.message);
    throw new Error('Failed to retrieve game history');
  }
}

/**
 * Get leaderboard
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of top players (default: 100)
 * @param {string} options.period - Time period (all, daily, weekly, monthly)
 * @returns {Promise<Array>} - Leaderboard entries
 */
async function getLeaderboard(options = {}) {
  try {
    const pool = await getPool();
    const limit = options.limit || 100;
    const period = options.period || 'all';

    // Build date filter based on period
    let dateFilter = '';
    if (period === 'daily') {
      dateFilter = 'AND gs.CreatedAt >= DATEADD(day, -1, GETUTCDATE())';
    } else if (period === 'weekly') {
      dateFilter = 'AND gs.CreatedAt >= DATEADD(week, -1, GETUTCDATE())';
    } else if (period === 'monthly') {
      dateFilter = 'AND gs.CreatedAt >= DATEADD(month, -1, GETUTCDATE())';
    }

    const query = `
      SELECT TOP (@limit)
        ROW_NUMBER() OVER (ORDER BY MAX(gs.FinalScore) DESC) as rank,
        u.Id as userId,
        u.Username as username,
        MAX(gs.FinalScore) as highestScore,
        COUNT(gs.Id) as totalGames,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM UserPremiumSubscriptions ups
            WHERE ups.UserId = u.Id 
            AND ups.IsActive = 1 
            AND ups.EndDate > GETUTCDATE()
          ) THEN 1
          ELSE 0
        END as isPremium,
        (
          SELECT TOP 1 pp.Name
          FROM UserPremiumSubscriptions ups
          JOIN PremiumPackages pp ON ups.PackageId = pp.Id
          WHERE ups.UserId = u.Id 
          AND ups.IsActive = 1 
          AND ups.EndDate > GETUTCDATE()
          ORDER BY ups.EndDate DESC
        ) as premiumPackage
      FROM Users u
      INNER JOIN GameSessions gs ON u.Id = gs.UserId
      WHERE gs.EndTime IS NOT NULL ${dateFilter}
      GROUP BY u.Id, u.Username
      ORDER BY MAX(gs.FinalScore) DESC
    `;

    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Get leaderboard error:', error.message);
    throw new Error('Failed to retrieve leaderboard');
  }
}

/**
 * Get user rank on leaderboard
 * @param {string} userId - User ID
 * @param {string} period - Time period (all, daily, weekly, monthly)
 * @returns {Promise<Object|null>} - User rank info or null
 */
async function getUserRank(userId, period = 'all') {
  try {
    const pool = await getPool();

    // Build date filter based on period
    let dateFilter = '';
    if (period === 'daily') {
      dateFilter = 'AND gs.CreatedAt >= DATEADD(day, -1, GETUTCDATE())';
    } else if (period === 'weekly') {
      dateFilter = 'AND gs.CreatedAt >= DATEADD(week, -1, GETUTCDATE())';
    } else if (period === 'monthly') {
      dateFilter = 'AND gs.CreatedAt >= DATEADD(month, -1, GETUTCDATE())';
    }

    const query = `
      WITH RankedUsers AS (
        SELECT 
          u.Id as userId,
          MAX(gs.FinalScore) as highestScore,
          ROW_NUMBER() OVER (ORDER BY MAX(gs.FinalScore) DESC) as rank
        FROM Users u
        INNER JOIN GameSessions gs ON u.Id = gs.UserId
        WHERE gs.EndTime IS NOT NULL ${dateFilter}
        GROUP BY u.Id
      )
      SELECT rank, highestScore
      FROM RankedUsers
      WHERE userId = @userId
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(query);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Get user rank error:', error.message);
    throw new Error('Failed to retrieve user rank');
  }
}

/**
 * Count user games in time period
 * @param {string} userId - User ID
 * @param {number} hours - Number of hours to look back
 * @returns {Promise<number>} - Number of games
 */
async function countUserGamesInPeriod(userId, hours) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT COUNT(*) as count
      FROM GameSessions
      WHERE UserId = @userId 
      AND CreatedAt >= DATEADD(hour, -@hours, GETUTCDATE())
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('hours', sql.Int, hours)
      .query(query);

    return result.recordset[0].count;
  } catch (error) {
    console.error('Count user games error:', error.message);
    throw new Error('Failed to count user games');
  }
}

module.exports = {
  createGameSession,
  updateGameSession,
  getSessionById,
  getUserGameHistory,
  getLeaderboard,
  getUserRank,
  countUserGamesInPeriod
};
