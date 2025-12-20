const emailService = require('../services/emailService');

/**
 * Email Controller
 * Handles email-related endpoints (admin/testing)
 */

/**
 * Send email (admin/testing endpoint)
 * POST /api/email/send
 */
exports.sendEmail = async (req, res, next) => {
  try {
    const { to, subject, template, data } = req.body;

    // Validate required fields
    if (!to || !subject || !template || !data) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: to, subject, template, data'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      });
    }

    // Validate template
    const validTemplates = ['verification', 'password-reset', 'payment-confirmation'];
    if (!validTemplates.includes(template)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TEMPLATE',
          message: `Invalid template. Must be one of: ${validTemplates.join(', ')}`
        }
      });
    }

    // Send email
    await emailService.sendEmail(to, subject, template, data);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        to,
        subject,
        template
      }
    });
  } catch (error) {
    console.error('Error in sendEmail controller:', error);
    next(error);
  }
};

/**
 * Verify SMTP connection
 * GET /api/email/verify
 */
exports.verifyConnection = async (req, res, next) => {
  try {
    const isConnected = await emailService.verifyConnection();

    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'SMTP connection verified successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'SMTP_CONNECTION_FAILED',
          message: 'Failed to verify SMTP connection'
        }
      });
    }
  } catch (error) {
    console.error('Error in verifyConnection controller:', error);
    next(error);
  }
};

/**
 * Send test verification email
 * POST /api/email/test/verification
 */
exports.sendTestVerification = async (req, res, next) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: email, username'
        }
      });
    }

    const verificationLink = `${process.env.API_BASE_URL}/api/auth/verify?token=test_token_123`;

    await emailService.sendVerificationEmail(email, {
      username,
      verificationLink
    });

    res.status(200).json({
      success: true,
      message: 'Test verification email sent successfully'
    });
  } catch (error) {
    console.error('Error in sendTestVerification controller:', error);
    next(error);
  }
};

/**
 * Send test password reset email
 * POST /api/email/test/password-reset
 */
exports.sendTestPasswordReset = async (req, res, next) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: email, username'
        }
      });
    }

    const resetLink = `${process.env.API_BASE_URL}/api/auth/reset-password?token=test_reset_token_123`;

    await emailService.sendPasswordResetEmail(email, {
      username,
      resetLink
    });

    res.status(200).json({
      success: true,
      message: 'Test password reset email sent successfully'
    });
  } catch (error) {
    console.error('Error in sendTestPasswordReset controller:', error);
    next(error);
  }
};

/**
 * Send test payment confirmation email
 * POST /api/email/test/payment-confirmation
 */
exports.sendTestPaymentConfirmation = async (req, res, next) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: email, username'
        }
      });
    }

    await emailService.sendEmail(email, 'Thanh toán thành công - ToolChess', 'payment-confirmation', {
      username,
      orderId: 'TEST_ORDER_' + Date.now(),
      packageName: 'Pro',
      amount: 199000,
      currency: 'VND',
      duration: 90,
      scoreBonus: 30
    });

    res.status(200).json({
      success: true,
      message: 'Test payment confirmation email sent successfully'
    });
  } catch (error) {
    console.error('Error in sendTestPaymentConfirmation controller:', error);
    next(error);
  }
};
