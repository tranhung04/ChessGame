const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

/**
 * User Routes
 * All routes require authentication
 */

/**
 * @route   GET /api/user/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @route   PUT /api/user/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, userController.updateMe);

module.exports = router;
