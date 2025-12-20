const gameSessionRepository = require('../repositories/gameSessionRepository');
const gameMoveRepository = require('../repositories/gameMoveRepository');
const premiumService = require('./premiumService');

/**
 * Game Service
 * Handles business logic for game sessions and validation
 */
class GameService {
  constructor() {
    // Leaderboard cache with 5 minute TTL
    this.leaderboardCache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }
  /**
   * Start a new game session
   * @param {string} userId - User ID
   * @param {string} mode - Game mode (normal, premium)
   * @returns {Promise<Object>} Created session
   */
  async startGameSession(userId, mode = 'normal') {
    try {
      // Check premium status
      const premiumStatus = await premiumService.checkPremiumStatus(userId);
      
      const sessionData = {
        userId,
        mode,
        premiumApplied: premiumStatus.isActive ? 1 : 0,
        scoreBonus: premiumStatus.isActive ? premiumStatus.scoreBonus : 0
      };

      const session = await gameSessionRepository.createGameSession(sessionData);

      return {
        session: {
          id: session.Id,
          userId: session.UserId,
          mode: session.Mode,
          startTime: session.StartTime,
          premiumApplied: session.PremiumApplied === 1,
          scoreBonus: session.ScoreBonus
        }
      };
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  }

  /**
   * Validate game submission
   * @param {Object} submissionData - Game submission data
   * @param {string} submissionData.sessionId - Session ID
   * @param {number} submissionData.score - Final score
   * @param {number} submissionData.turnCount - Number of turns
   * @param {number} submissionData.duration - Duration in seconds
   * @param {Array} submissionData.moves - Optional move list
   * @returns {Promise<Object>} Validation result
   */
  async validateGameSubmission(submissionData) {
    try {
      const { sessionId, score, turnCount, duration, moves } = submissionData;

      // Get session
      const session = await gameSessionRepository.getSessionById(sessionId);
      
      if (!session) {
        return {
          isValid: false,
          error: 'INVALID_SESSION',
          message: 'Game session not found'
        };
      }

      if (session.EndTime) {
        return {
          isValid: false,
          error: 'SESSION_ALREADY_ENDED',
          message: 'Game session has already ended'
        };
      }

      // Validate score bounds
      const maxPossibleScore = this.calculateMaxPossibleScore(session.ScoreBonus);
      if (score > maxPossibleScore) {
        return {
          isValid: false,
          error: 'INVALID_SCORE',
          message: 'Score exceeds maximum possible value',
          details: {
            submittedScore: score,
            maxPossibleScore
          }
        };
      }

      if (score < 0) {
        return {
          isValid: false,
          error: 'INVALID_SCORE',
          message: 'Score cannot be negative'
        };
      }

      // Validate turn count
      if (turnCount < 0) {
        return {
          isValid: false,
          error: 'INVALID_TURN_COUNT',
          message: 'Turn count cannot be negative'
        };
      }

      // Validate duration
      if (duration < 0) {
        return {
          isValid: false,
          error: 'INVALID_DURATION',
          message: 'Duration cannot be negative'
        };
      }

      // Minimum time validation (anti-cheat)
      const minTimePerTurn = 0.5; // 0.5 seconds per turn minimum
      const minDuration = turnCount * minTimePerTurn;
      if (duration < minDuration && turnCount > 0) {
        return {
          isValid: false,
          error: 'SUSPICIOUS_DURATION',
          message: 'Game completed too quickly',
          details: {
            duration,
            minDuration,
            turnCount
          }
        };
      }

      // Validate moves if provided
      if (moves && moves.length > 0) {
        const moveValidation = this.validateMoves(moves, turnCount);
        if (!moveValidation.isValid) {
          return moveValidation;
        }
      }

      return {
        isValid: true,
        session
      };
    } catch (error) {
      console.error('Error validating game submission:', error);
      throw error;
    }
  }

  /**
   * Calculate final score with premium bonus
   * @param {number} baseScore - Base score
   * @param {number} premiumBonus - Premium bonus percentage (0-1)
   * @returns {number} Final score
   */
  calculateFinalScore(baseScore, premiumBonus) {
    if (premiumBonus <= 0) {
      return baseScore;
    }
    
    return Math.floor(baseScore * (1 + premiumBonus));
  }

  /**
   * Calculate maximum possible score
   * @param {number} premiumBonus - Premium bonus percentage (0-1)
   * @returns {number} Maximum possible score
   */
  calculateMaxPossibleScore(premiumBonus = 0) {
    // Base piece values from chess game
    const pieceValues = {
      'tot': 10,      // Tốt (Pawn)
      'phao': 50,     // Pháo (Cannon)
      'ma': 40,       // Mã (Horse)
      'xe': 90,       // Xe (Chariot)
      'si': 20,       // Sĩ (Advisor)
      'tuong': 20,    // Tượng (Elephant)
      'tuongDich': 200 // Tướng địch (Enemy General)
    };

    // Maximum number of each piece type on board
    const maxPieces = {
      'tot': 5,
      'phao': 2,
      'ma': 2,
      'xe': 2,
      'si': 2,
      'tuong': 2,
      'tuongDich': 1
    };

    // Calculate base max score
    let baseMaxScore = 0;
    for (const [type, value] of Object.entries(pieceValues)) {
      baseMaxScore += value * maxPieces[type];
    }

    // Apply premium bonus
    const maxScore = this.calculateFinalScore(baseMaxScore, premiumBonus);
    
    // Add some buffer for fire mode and special scenarios (20%)
    return Math.floor(maxScore * 1.2);
  }

  /**
   * Validate move list
   * @param {Array} moves - Array of moves
   * @param {number} expectedTurnCount - Expected number of turns
   * @returns {Object} Validation result
   */
  validateMoves(moves, expectedTurnCount) {
    // Check move count matches turn count
    if (moves.length !== expectedTurnCount) {
      return {
        isValid: false,
        error: 'MOVE_COUNT_MISMATCH',
        message: 'Move count does not match turn count',
        details: {
          moveCount: moves.length,
          expectedTurnCount
        }
      };
    }

    // Validate each move structure
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      
      if (!move.from || !move.to) {
        return {
          isValid: false,
          error: 'INVALID_MOVE_FORMAT',
          message: `Move ${i + 1} has invalid format`
        };
      }

      // Validate coordinates
      const [fromRow, fromCol] = move.from;
      const [toRow, toCol] = move.to;

      if (!this.isValidCoordinate(fromRow, fromCol) || !this.isValidCoordinate(toRow, toCol)) {
        return {
          isValid: false,
          error: 'INVALID_COORDINATES',
          message: `Move ${i + 1} has invalid coordinates`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Check if coordinate is valid
   * @param {number} row - Row (0-8)
   * @param {number} col - Column (0-7)
   * @returns {boolean} True if valid
   */
  isValidCoordinate(row, col) {
    return row >= 0 && row < 9 && col >= 0 && col < 8;
  }

  /**
   * Submit game and update session
   * @param {Object} submissionData - Game submission data
   * @returns {Promise<Object>} Updated session with rank
   */
  async submitGame(submissionData) {
    try {
      // Validate submission
      const validation = await this.validateGameSubmission(submissionData);
      
      if (!validation.isValid) {
        throw new Error(validation.message || 'Invalid game submission');
      }

      const session = validation.session;
      const { sessionId, score, turnCount, duration, moves } = submissionData;

      // Calculate final score with premium bonus
      const finalScore = this.calculateFinalScore(score, session.ScoreBonus);

      // Update session
      const updates = {
        endTime: new Date(),
        score,
        turnCount,
        duration,
        finalScore
      };

      const updatedSession = await gameSessionRepository.updateGameSession(sessionId, updates);

      // Store moves if provided (optional for anti-cheat)
      if (moves && moves.length > 0) {
        const moveRecords = moves.map((move, index) => ({
          sessionId,
          moveNumber: index + 1,
          fromRow: move.from[0],
          fromCol: move.from[1],
          toRow: move.to[0],
          toCol: move.to[1],
          pieceType: move.pieceType || 'unknown',
          capturedPiece: move.captured || null,
          scoreGained: move.scoreGained || 0
        }));

        await gameMoveRepository.storeMovesBatch(moveRecords);
      }

      // Get user rank
      const userRank = await gameSessionRepository.getUserRank(session.UserId);

      // Check if new high score
      const userStats = await this.getUserStatistics(session.UserId);
      const isNewHighScore = finalScore === userStats.highestScore;

      // Clear leaderboard cache since rankings may have changed
      this.clearLeaderboardCache();

      return {
        session: {
          id: updatedSession.Id,
          score: updatedSession.Score,
          finalScore: updatedSession.FinalScore,
          turnCount: updatedSession.TurnCount,
          duration: updatedSession.Duration,
          rank: userRank ? userRank.rank : null,
          isNewHighScore
        }
      };
    } catch (error) {
      console.error('Error submitting game:', error);
      throw error;
    }
  }

  /**
   * Get user game history
   * @param {string} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Game history with pagination
   */
  async getUserGameHistory(userId, options = {}) {
    try {
      const result = await gameSessionRepository.getUserGameHistory(userId, options);
      
      // Format sessions
      const sessions = result.sessions.map(session => ({
        id: session.Id,
        mode: session.Mode,
        score: session.Score,
        finalScore: session.FinalScore,
        turnCount: session.TurnCount,
        duration: session.Duration,
        premiumApplied: session.PremiumApplied === 1,
        createdAt: session.CreatedAt
      }));

      return {
        sessions,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error getting user game history:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Leaderboard data
   */
  async getLeaderboard(options = {}) {
    try {
      const limit = options.limit || 100;
      const period = options.period || 'all';
      
      // Create cache key based on options
      const cacheKey = `leaderboard_${limit}_${period}`;
      
      // Check cache
      const cached = this.leaderboardCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('Returning cached leaderboard');
        return cached.data;
      }
      
      // Fetch from database
      const leaderboard = await gameSessionRepository.getLeaderboard(options);
      
      // Format leaderboard entries
      const formattedLeaderboard = leaderboard.map(entry => ({
        rank: entry.rank,
        userId: entry.userId,
        username: entry.username,
        highestScore: entry.highestScore,
        totalGames: entry.totalGames,
        isPremium: entry.isPremium === 1,
        premiumPackage: entry.premiumPackage
      }));

      const result = {
        leaderboard: formattedLeaderboard
      };
      
      // Store in cache
      this.leaderboardCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      // Clean up expired cache entries
      this.cleanExpiredCache();

      return result;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Clean up expired cache entries
   * @private
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.leaderboardCache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.leaderboardCache.delete(key);
      }
    }
  }

  /**
   * Clear leaderboard cache
   * Called when a new game is submitted to ensure fresh data
   */
  clearLeaderboardCache() {
    this.leaderboardCache.clear();
    console.log('Leaderboard cache cleared');
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics(userId) {
    try {
      const history = await gameSessionRepository.getUserGameHistory(userId, { limit: 1000 });
      
      if (history.sessions.length === 0) {
        return {
          totalGames: 0,
          highestScore: 0,
          averageScore: 0
        };
      }

      const totalGames = history.sessions.length;
      const highestScore = Math.max(...history.sessions.map(s => s.FinalScore));
      const totalScore = history.sessions.reduce((sum, s) => sum + s.FinalScore, 0);
      const averageScore = Math.round(totalScore / totalGames);

      return {
        totalGames,
        highestScore,
        averageScore
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Detect suspicious scores (anti-cheat)
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Suspicion analysis
   */
  async detectSuspiciousScore(sessionId) {
    try {
      const session = await gameSessionRepository.getSessionById(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      const suspicions = [];

      // Check if score exceeds maximum
      const maxPossible = this.calculateMaxPossibleScore(session.ScoreBonus);
      if (session.FinalScore > maxPossible) {
        suspicions.push({
          type: 'SCORE_TOO_HIGH',
          message: 'Score exceeds maximum possible',
          details: { score: session.FinalScore, maxPossible }
        });
      }

      // Check duration vs turn count
      if (session.Duration && session.TurnCount > 0) {
        const avgTimePerTurn = session.Duration / session.TurnCount;
        if (avgTimePerTurn < 0.5) {
          suspicions.push({
            type: 'TOO_FAST',
            message: 'Game completed too quickly',
            details: { avgTimePerTurn, duration: session.Duration, turnCount: session.TurnCount }
          });
        }
      }

      // Check if moves were recorded and validate
      const moves = await gameMoveRepository.getMovesBySession(sessionId);
      if (moves.length > 0) {
        const moveValidation = await gameMoveRepository.validateMoveSequence(sessionId);
        if (!moveValidation.isValid) {
          suspicions.push({
            type: 'INVALID_MOVE_SEQUENCE',
            message: 'Move sequence is invalid',
            details: moveValidation
          });
        }
      }

      return {
        isSuspicious: suspicions.length > 0,
        suspicions,
        session: {
          id: session.Id,
          score: session.Score,
          finalScore: session.FinalScore,
          turnCount: session.TurnCount,
          duration: session.Duration
        }
      };
    } catch (error) {
      console.error('Error detecting suspicious score:', error);
      throw error;
    }
  }

  /**
   * Check rate limit for game submission
   * @param {string} userId - User ID
   * @param {number} maxGamesPerHour - Maximum games per hour (default: 10)
   * @returns {Promise<Object>} Rate limit status
   */
  async checkRateLimit(userId, maxGamesPerHour = 10) {
    try {
      const gamesInLastHour = await gameSessionRepository.countUserGamesInPeriod(userId, 1);
      
      const isLimited = gamesInLastHour >= maxGamesPerHour;
      const remaining = Math.max(0, maxGamesPerHour - gamesInLastHour);

      return {
        isLimited,
        gamesPlayed: gamesInLastHour,
        maxGames: maxGamesPerHour,
        remaining,
        resetIn: 3600 // seconds (1 hour)
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      throw error;
    }
  }
}

module.exports = new GameService();
