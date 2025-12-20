const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticate } = require('../middleware/auth');

/**
 * Email Routes
 * All routes are for admin/testing purposes
 */

/**
 * @route   POST /api/email/send
 * @desc    Send email with specified template (admin/testing)
 * @access  Public (should be protected in production)
 */
router.post('/send', emailController.sendEmail);

/**
 * @route   GET /api/email/verify
 * @desc    Verify SMTP connection
 * @access  Public
 */
router.get('/verify', emailController.verifyConnection);

/**
 * @route   POST /api/email/test/verification
 * @desc    Send test verification email
 * @access  Public (for testing)
 */
router.post('/test/verification', emailController.sendTestVerification);

/**
 * @route   POST /api/email/test/password-reset
 * @desc    Send test password reset email
 * @access  Public (for testing)
 */
router.post('/test/password-reset', emailController.sendTestPasswordReset);

/**
 * @route   POST /api/email/test/payment-confirmation
 * @desc    Send test payment confirmation email
 * @access  Public (for testing)
 */
router.post('/test/payment-confirmation', emailController.sendTestPaymentConfirmation);

module.exports = router;
