const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { authenticate } = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cacheMiddleware');

/**
 * Premium Routes
 * All routes require authentication
 */

// Get all premium packages (public - no auth required, cached for 1 hour)
router.get('/packages', cacheMiddleware.cache({ ttl: 60 * 60 * 1000 }), (req, res, next) => premiumController.getPackages(req, res, next));

// Get current user's premium status (requires auth, cached for 5 minutes)
router.get('/status', authenticate, cacheMiddleware.cache({ ttl: 5 * 60 * 1000 }), (req, res, next) => premiumController.getStatus(req, res, next));

// Subscribe to a premium package (requires auth)
router.post('/subscribe', authenticate, (req, res, next) => premiumController.subscribe(req, res, next));

// Use a revive from premium subscription (requires auth)
router.post('/use-revive', authenticate, (req, res, next) => premiumController.useRevive(req, res, next));

module.exports = router;
