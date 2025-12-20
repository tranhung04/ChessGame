const gameService = require('../services/gameService');

/**
 * Game Controller
 * Handles HTTP requests for game sessions
 */
class GameController {
  /**
   * Start a new game session
   * POST /api/game/start
   * Body: { mode }
   */
  async startGame(req, res, next) {
    try {
      const { mode = 'normal' } = req.body;
      const userId = req.user.userId;

      // Validate mode
      if (!['normal', 'premium'].includes(mode)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid game mode',
            details: { field: 'mode', allowedValues: ['normal', 'premium'] }
          }
        });
      }

      // Check rate limit
      const rateLimit = await gameService.checkRateLimit(userId);
      if (rateLimit.isLimited) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many games started. Please try again later.',
            details: {
              gamesPlayed: rateLimit.gamesPlayed,
              maxGames: rateLimit.maxGames,
              resetIn: rateLimit.resetIn
            }
          }
        });
      }

      // Start game session
      const result = await gameService.startGameSession(userId, mode);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in startGame:', error);
      next(error);
    }
  }

  /**
   * Submit game results
   * POST /api/game/submit
   * Body: { sessionId, score, turnCount, duration, moves }
   */
  async submitGame(req, res, next) {
    try {
      const { sessionId, score, turnCount, duration, moves } = req.body;
      const userId = req.user.userId;

      // Validate required fields
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required',
            details: { field: 'sessionId' }
          }
        });
      }

      if (score === undefined || score === null) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Score is required',
            details: { field: 'score' }
          }
        });
      }

      if (turnCount === undefined || turnCount === null) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Turn count is required',
            details: { field: 'turnCount' }
          }
        });
      }

      if (duration === undefined || duration === null) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Duration is required',
            details: { field: 'duration' }
          }
        });
      }

      // Validate data types
      if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Score must be a non-negative number',
            details: { field: 'score' }
          }
        });
      }

      if (typeof turnCount !== 'number' || turnCount < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Turn count must be a non-negative number',
            details: { field: 'turnCount' }
          }
        });
      }

      if (typeof duration !== 'number' || duration < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Duration must be a non-negative number',
            details: { field: 'duration' }
          }
        });
      }

      // Submit game
      const submissionData = {
        sessionId,
        score,
        turnCount,
        duration,
        moves: moves || []
      };

      const result = await gameService.submitGame(submissionData);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in submitGame:', error);
      
      // Handle specific validation errors
      if (error.message.includes('INVALID_SESSION') || error.message === 'Game session not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Game session not found'
          }
        });
      }

      if (error.message.includes('SESSION_ALREADY_ENDED')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SESSION_ALREADY_ENDED',
            message: 'Game session has already ended'
          }
        });
      }

      if (error.message.includes('Score exceeds maximum')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SCORE',
            message: error.message
          }
        });
      }

      if (error.message.includes('too quickly') || error.message.includes('SUSPICIOUS')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ANTI_CHEAT_VIOLATION',
            message: error.message
          }
        });
      }

      next(error);
    }
  }

  /**
   * Get user game history
   * GET /api/game/history
   * Query: page, limit
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Validate pagination
      if (page < 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Page must be greater than 0',
            details: { field: 'page' }
          }
        });
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Limit must be between 1 and 100',
            details: { field: 'limit' }
          }
        });
      }

      const result = await gameService.getUserGameHistory(userId, { page, limit });
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getHistory:', error);
      next(error);
    }
  }

  /**
   * Get leaderboard
   * GET /api/game/leaderboard
   * Query: limit, period
   */
  async getLeaderboard(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const period = req.query.period || 'all';

      // Validate limit
      if (limit < 1 || limit > 1000) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Limit must be between 1 and 1000',
            details: { field: 'limit' }
          }
        });
      }

      // Validate period
      if (!['all', 'daily', 'weekly', 'monthly'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid period',
            details: { field: 'period', allowedValues: ['all', 'daily', 'weekly', 'monthly'] }
          }
        });
      }

      const result = await gameService.getLeaderboard({ limit, period });
      
      // Get current user rank if authenticated
      let currentUser = null;
      if (req.user && req.user.userId) {
        const userStats = await gameService.getUserStatistics(req.user.userId);
        currentUser = {
          highestScore: userStats.highestScore,
          totalGames: userStats.totalGames
        };
      }

      res.status(200).json({
        success: true,
        data: {
          ...result,
          currentUser
        }
      });
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/game/stats
   */
  async getStats(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const stats = await gameService.getUserStatistics(userId);
      
      res.status(200).json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      next(error);
    }
  }

  /**
   * Get session details
   * GET /api/game/session/:sessionId
   */
  async getSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.userId;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required',
            details: { field: 'sessionId' }
          }
        });
      }

      // Get session from repository
      const gameSessionRepository = require('../repositories/gameSessionRepository');
      const session = await gameSessionRepository.getSessionById(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Game session not found'
          }
        });
      }

      // Verify session belongs to user
      if (session.UserId !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this session'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          session: {
            id: session.Id,
            userId: session.UserId,
            mode: session.Mode,
            startTime: session.StartTime,
            endTime: session.EndTime,
            score: session.Score,
            finalScore: session.FinalScore,
            turnCount: session.TurnCount,
            duration: session.Duration,
            premiumApplied: session.PremiumApplied === 1,
            scoreBonus: session.ScoreBonus,
            createdAt: session.CreatedAt
          }
        }
      });
    } catch (error) {
      console.error('Error in getSession:', error);
      next(error);
    }
  }
}

module.exports = new GameController();
