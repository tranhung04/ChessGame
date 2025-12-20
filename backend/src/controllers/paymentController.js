const paymentRepository = require('../repositories/paymentRepository');
const premiumPackageRepository = require('../repositories/premiumPackageRepository');
const vnpayService = require('../services/vnpayService');
const { v4: uuidv4 } = require('uuid');

/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */
class PaymentController {
  /**
   * Create VNPay payment URL
   * POST /api/payment/vnpay/create
   */
  async createVNPayPayment(req, res, next) {
    try {
      const { packageId, returnUrl } = req.body;
      const userId = req.user.userId;

      // Validate required fields
      if (!packageId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Package ID is required',
            details: { field: 'packageId' }
          }
        });
      }

      // Get package details
      const premiumPackage = await premiumPackageRepository.getPackageById(packageId);
      if (!premiumPackage) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message: 'Premium package not found',
            details: { packageId }
          }
        });
      }

      // Check if package is active
      if (!premiumPackage.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message: 'Premium package is not available',
            details: { packageId }
          }
        });
      }

      // Generate unique order ID
      const orderId = `ORDER_${Date.now()}_${uuidv4().substring(0, 8)}`;

      // Create payment record in database
      const payment = await paymentRepository.createPayment({
        userId,
        orderId,
        packageId,
        amount: premiumPackage.price,
        currency: premiumPackage.currency || 'VND',
        status: 'pending',
        paymentMethod: 'vnpay'
      });

      // Generate VNPay payment URL
      const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const paymentUrl = vnpayService.generatePaymentUrl({
        orderId,
        amount: premiumPackage.price,
        orderInfo: `Thanh toan goi ${premiumPackage.name} - ToolChess`,
        ipAddr
      });

      // Calculate expiry time (15 minutes from now)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      res.status(200).json({
        success: true,
        data: {
          orderId,
          paymentUrl,
          amount: premiumPackage.price,
          currency: premiumPackage.currency || 'VND',
          packageName: premiumPackage.name,
          expiresAt: expiresAt.toISOString()
        }
      });
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      next(error);
    }
  }

  /**
   * Handle VNPay payment callback
   * GET /api/payment/vnpay/return
   */
  async handleVNPayReturn(req, res, next) {
    try {
      const vnpParams = req.query;

      // Verify VNPay signature
      const isValidSignature = vnpayService.verifySignature(vnpParams);
      
      if (!isValidSignature) {
        console.error('Invalid VNPay signature:', vnpParams);
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'VNPay signature verification failed'
          }
        });
      }

      const orderId = vnpParams.vnp_TxnRef;
      const responseCode = vnpParams.vnp_ResponseCode;
      const transactionNo = vnpParams.vnp_TransactionNo;
      const amount = parseInt(vnpParams.vnp_Amount) / 100; // Convert back to VND

      // Get payment record
      const payment = await paymentRepository.getPaymentByOrderId(orderId);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PAYMENT_NOT_FOUND',
            message: 'Payment record not found',
            details: { orderId }
          }
        });
      }

      // Parse response code to status
      const status = vnpayService.parseResponseCode(responseCode);
      const message = vnpayService.getResponseMessage(responseCode);

      // Update payment status
      await paymentRepository.updatePaymentStatus(orderId, {
        status,
        vnpayData: {
          responseCode,
          transactionNo,
          amount,
          bankCode: vnpParams.vnp_BankCode,
          cardType: vnpParams.vnp_CardType,
          payDate: vnpParams.vnp_PayDate,
          message
        }
      });

      // If payment successful, activate premium and send email
      if (status === 'completed') {
        const paymentService = require('../services/paymentService');
        await paymentService.processSuccessfulPayment(orderId);
      }

      // If payment failed, handle failure
      if (status === 'failed') {
        const paymentService = require('../services/paymentService');
        await paymentService.handlePaymentFailure(orderId, message);
      }

      res.status(200).json({
        success: true,
        data: {
          orderId,
          status,
          message,
          transactionNo
        }
      });
    } catch (error) {
      console.error('Error handling VNPay return:', error);
      next(error);
    }
  }

  /**
   * Get payment status by order ID
   * GET /api/payment/status/:orderId
   */
  async getPaymentStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user.userId;

      // Get payment record
      const payment = await paymentRepository.getPaymentByOrderId(orderId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PAYMENT_NOT_FOUND',
            message: 'Payment record not found',
            details: { orderId }
          }
        });
      }

      // Verify payment belongs to user
      if (payment.UserId !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to view this payment'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          orderId: payment.OrderId,
          status: payment.Status,
          amount: payment.Amount,
          currency: payment.Currency,
          packageId: payment.PackageId,
          packageName: payment.PackageName,
          createdAt: payment.CreatedAt,
          completedAt: payment.CompletedAt,
          vnpayData: payment.VnpayData ? JSON.parse(payment.VnpayData) : null
        }
      });
    } catch (error) {
      console.error('Error getting payment status:', error);
      next(error);
    }
  }

  /**
   * Get user payment history
   * GET /api/payment/history
   */
  async getPaymentHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await paymentRepository.getUserPaymentHistory(userId, {
        page,
        limit
      });

      res.status(200).json({
        success: true,
        data: {
          payments: result.payments.map(payment => ({
            orderId: payment.OrderId,
            packageName: payment.PackageName,
            amount: payment.Amount,
            currency: payment.Currency,
            status: payment.Status,
            createdAt: payment.CreatedAt,
            completedAt: payment.CompletedAt
          })),
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('Error getting payment history:', error);
      next(error);
    }
  }
}

module.exports = new PaymentController();
