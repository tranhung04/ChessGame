const premiumPackageRepository = require('../repositories/premiumPackageRepository');
const userPremiumSubscriptionRepository = require('../repositories/userPremiumSubscriptionRepository');

/**
 * Premium Service
 * Handles business logic for premium packages and subscriptions
 */
class PremiumService {
  /**
   * Calculate premium bonus for a base score
   * @param {number} baseScore - Base score without bonus
   * @param {number} bonusPercentage - Bonus percentage (e.g., 0.3 for 30%)
   * @returns {number} Final score with bonus applied
   */
  calculatePremiumBonus(baseScore, bonusPercentage) {
    if (bonusPercentage <= 0) {
      return baseScore;
    }
    
    const finalScore = Math.floor(baseScore * (1 + bonusPercentage));
    return finalScore;
  }

  /**
   * Check premium status for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Premium status object
   */
  async checkPremiumStatus(userId) {
    try {
      const subscription = await userPremiumSubscriptionRepository.getActiveSubscriptionByUser(userId);
      
      if (!subscription) {
        return {
          isActive: false,
          package: null,
          scoreBonus: 0,
          revivesLeft: 0,
          expiresAt: null
        };
      }

      // Check if subscription is expired
      const isExpired = await userPremiumSubscriptionRepository.isSubscriptionExpired(subscription.id);
      
      if (isExpired) {
        return {
          isActive: false,
          package: null,
          scoreBonus: 0,
          revivesLeft: 0,
          expiresAt: null
        };
      }

      const revivesLeft = Math.max(0, subscription.reviveCount - subscription.revivesUsed);

      return {
        isActive: true,
        package: subscription.packageName,
        packageId: subscription.packageId,
        scoreBonus: subscription.scoreBonus,
        revivesLeft: revivesLeft,
        revivesUsed: subscription.revivesUsed,
        expiresAt: subscription.endDate,
        subscriptionId: subscription.id
      };
    } catch (error) {
      console.error('Error checking premium status:', error);
      throw error;
    }
  }

  /**
   * Activate premium subscription for a user
   * @param {string} userId - User ID
   * @param {string} packageId - Package ID
   * @returns {Promise<Object>} Created subscription
   */
  async activatePremiumSubscription(userId, packageId) {
    try {
      // Get package details
      const packageDetails = await premiumPackageRepository.getPackageById(packageId);
      
      if (!packageDetails) {
        throw new Error('Package not found');
      }

      if (!packageDetails.isActive) {
        throw new Error('Package is not active');
      }

      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + packageDetails.durationDays);

      // Create subscription
      const subscription = await userPremiumSubscriptionRepository.createSubscription(
        userId,
        packageId,
        startDate,
        endDate
      );

      return {
        subscription: {
          id: subscription.id,
          packageId: subscription.packageId,
          packageName: packageDetails.name,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          isActive: subscription.isActive,
          scoreBonus: packageDetails.scoreBonus,
          reviveCount: packageDetails.reviveCount
        }
      };
    } catch (error) {
      console.error('Error activating premium subscription:', error);
      throw error;
    }
  }

  /**
   * Get all available premium packages
   * @returns {Promise<Array>} Array of premium packages
   */
  async getAllPackages() {
    try {
      const packages = await premiumPackageRepository.getAllPackages();
      return packages;
    } catch (error) {
      console.error('Error getting all packages:', error);
      throw error;
    }
  }

  /**
   * Use a revive from premium subscription
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated premium status
   */
  async useRevive(userId) {
    try {
      const premiumStatus = await this.checkPremiumStatus(userId);
      
      if (!premiumStatus.isActive) {
        throw new Error('No active premium subscription');
      }

      if (premiumStatus.revivesLeft <= 0) {
        throw new Error('No revives left');
      }

      // Update revives used
      const newRevivesUsed = premiumStatus.revivesUsed + 1;
      await userPremiumSubscriptionRepository.updateRevivesUsed(
        premiumStatus.subscriptionId,
        newRevivesUsed
      );

      // Return updated status
      return await this.checkPremiumStatus(userId);
    } catch (error) {
      console.error('Error using revive:', error);
      throw error;
    }
  }

  /**
   * Deactivate expired subscriptions (maintenance task)
   * @returns {Promise<number>} Number of subscriptions deactivated
   */
  async deactivateExpiredSubscriptions() {
    try {
      const count = await userPremiumSubscriptionRepository.deactivateExpiredSubscriptions();
      console.log(`Deactivated ${count} expired subscriptions`);
      return count;
    } catch (error) {
      console.error('Error deactivating expired subscriptions:', error);
      throw error;
    }
  }
}

module.exports = new PremiumService();
