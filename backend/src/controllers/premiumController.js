const premiumService = require('../services/premiumService');

/**
 * Premium Controller
 * Handles HTTP requests for premium packages and subscriptions
 */
class PremiumController {
  /**
   * Get all premium packages
   * GET /api/premium/packages
   */
  async getPackages(req, res, next) {
    try {
      const packages = await premiumService.getAllPackages();
      
      res.status(200).json({
        success: true,
        data: {
          packages
        }
      });
    } catch (error) {
      console.error('Error in getPackages:', error);
      next(error);
    }
  }

  /**
   * Subscribe to a premium package
   * POST /api/premium/subscribe
   * Body: { packageId, paymentId }
   */
  async subscribe(req, res, next) {
    try {
      const { packageId, paymentId } = req.body;
      const userId = req.user.userId;

      // Validate input
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

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payment ID is required',
            details: { field: 'paymentId' }
          }
        });
      }

      // TODO: Verify payment is completed before activating subscription
      // This will be implemented in the payment integration task
      // For now, we'll activate the subscription directly

      // Activate premium subscription
      const result = await premiumService.activatePremiumSubscription(userId, packageId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in subscribe:', error);
      
      if (error.message === 'Package not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message: 'Premium package not found',
            details: { packageId: req.body.packageId }
          }
        });
      }

      if (error.message === 'Package is not active') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message: 'Premium package is not active',
            details: { packageId: req.body.packageId }
          }
        });
      }

      next(error);
    }
  }

  /**
   * Get current user's premium status
   * GET /api/premium/status
   */
  async getStatus(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const premiumStatus = await premiumService.checkPremiumStatus(userId);
      
      res.status(200).json({
        success: true,
        data: {
          premium: premiumStatus
        }
      });
    } catch (error) {
      console.error('Error in getStatus:', error);
      next(error);
    }
  }

  /**
   * Use a revive from premium subscription
   * POST /api/premium/use-revive
   */
  async useRevive(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const updatedStatus = await premiumService.useRevive(userId);
      
      res.status(200).json({
        success: true,
        data: {
          premium: updatedStatus
        }
      });
    } catch (error) {
      console.error('Error in useRevive:', error);
      
      if (error.message === 'No active premium subscription') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PREMIUM_REQUIRED',
            message: 'No active premium subscription'
          }
        });
      }

      if (error.message === 'No revives left') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_REVIVES_LEFT',
            message: 'No revives remaining in your premium subscription'
          }
        });
      }

      next(error);
    }
  }
}

module.exports = new PremiumController();
