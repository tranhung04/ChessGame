const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiter for payment endpoints (3 requests per minute)
const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX) || 3,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many payment requests. Please try again later.'
    }
  }
});

/**
 * @route   POST /api/payment/vnpay/create
 * @desc    Create VNPay payment URL
 * @access  Private
 */
router.post(
  '/vnpay/create',
  authenticate,
  paymentRateLimiter,
  paymentController.createVNPayPayment
);

/**
 * @route   GET /api/payment/vnpay/return
 * @desc    Handle VNPay payment callback
 * @access  Public (VNPay callback)
 */
router.get(
  '/vnpay/return',
  paymentController.handleVNPayReturn
);

/**
 * @route   GET /api/payment/status/:orderId
 * @desc    Get payment status by order ID
 * @access  Private
 */
router.get(
  '/status/:orderId',
  authenticate,
  paymentController.getPaymentStatus
);

/**
 * @route   GET /api/payment/history
 * @desc    Get user payment history
 * @access  Private
 */
router.get(
  '/history',
  authenticate,
  paymentController.getPaymentHistory
);

module.exports = router;
