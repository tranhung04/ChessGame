const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticate } = require('../middleware/auth');
const { gameSubmitLimiter } = require('../middleware/rateLimiter');
const cacheMiddleware = require('../middleware/cacheMiddleware');

/**
 * Game Routes
 * Most routes require authentication
 */

// Start a new game session (requires auth, rate limited)
router.post('/start', authenticate, gameSubmitLimiter, (req, res, next) => gameController.startGame(req, res, next));

// Submit game results (requires auth, rate limited)
router.post('/submit', authenticate, gameSubmitLimiter, (req, res, next) => gameController.submitGame(req, res, next));

// Get user game history (requires auth, cached for 2 minutes)
router.get('/history', authenticate, cacheMiddleware.cache({ ttl: 2 * 60 * 1000 }), (req, res, next) => gameController.getHistory(req, res, next));

// Get leaderboard (public - no auth required, cached for 5 minutes)
router.get('/leaderboard', cacheMiddleware.cache({ ttl: 5 * 60 * 1000 }), (req, res, next) => gameController.getLeaderboard(req, res, next));

// Get user statistics (requires auth, cached for 5 minutes)
router.get('/stats', authenticate, cacheMiddleware.cache({ ttl: 5 * 60 * 1000 }), (req, res, next) => gameController.getStats(req, res, next));

// Get session details (requires auth)
router.get('/session/:sessionId', authenticate, (req, res, next) => gameController.getSession(req, res, next));

module.exports = router;
