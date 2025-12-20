const paymentRepository = require('../repositories/paymentRepository');
const premiumService = require('./premiumService');
const emailService = require('./emailService');

/**
 * Payment Service
 * Handles payment business logic
 */
class PaymentService {
  /**
   * Process successful payment
   * - Activate premium subscription
   * - Send confirmation email
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Processing result
   */
  async processSuccessfulPayment(orderId) {
    try {
      // Get payment details
      const payment = await paymentRepository.getPaymentByOrderId(orderId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check if already processed
      if (payment.Status === 'completed') {
        console.log(`Payment ${orderId} already processed`);
        return {
          success: true,
          message: 'Payment already processed',
          alreadyProcessed: true
        };
      }

      // Activate premium subscription
      const subscription = await premiumService.activatePremiumSubscription(
        payment.UserId,
        payment.PackageId
      );

      console.log(`Premium subscription activated for user ${payment.UserId}, package ${payment.PackageId}`);

      // Send confirmation email (non-blocking)
      this.sendPaymentConfirmationEmail(payment)
        .catch(error => {
          console.error('Error sending payment confirmation email:', error);
          // Don't throw - email failure shouldn't fail the payment
        });

      return {
        success: true,
        message: 'Payment processed successfully',
        subscription
      };
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }

  /**
   * Send payment confirmation email
   * @param {Object} payment - Payment record
   * @returns {Promise<void>}
   */
  async sendPaymentConfirmationEmail(payment) {
    try {
      // Get user details (we'll need to fetch from user repository)
      // For now, we'll use a placeholder
      const emailData = {
        orderId: payment.OrderId,
        packageName: payment.PackageName,
        amount: payment.Amount,
        currency: payment.Currency || 'VND',
        duration: payment.DurationDays,
        scoreBonus: Math.round(payment.ScoreBonus * 100) // Convert to percentage
      };

      // Send email using email service
      await emailService.sendPaymentConfirmation(payment.UserId, emailData);
      
      console.log(`Payment confirmation email sent for order ${payment.OrderId}`);
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   * @param {string} orderId - Order ID
   * @param {string} reason - Failure reason
   * @returns {Promise<void>}
   */
  async handlePaymentFailure(orderId, reason) {
    try {
      const payment = await paymentRepository.getPaymentByOrderId(orderId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      console.log(`Payment ${orderId} failed: ${reason}`);
      
      // Could send failure notification email here if needed
      // For now, just log it
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  /**
   * Check and expire old pending payments
   * Should be run periodically (e.g., via cron job)
   * @returns {Promise<number>} Number of payments expired
   */
  async expireOldPendingPayments() {
    try {
      const count = await paymentRepository.markExpiredPayments(15); // 15 minutes
      
      if (count > 0) {
        console.log(`Expired ${count} old pending payments`);
      }
      
      return count;
    } catch (error) {
      console.error('Error expiring old pending payments:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
