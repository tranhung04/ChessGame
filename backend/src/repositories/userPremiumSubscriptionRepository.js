const { executeQuery } = require('../config/database');

/**
 * User Premium Subscription Repository
 * Handles database operations for user premium subscriptions
 */
class UserPremiumSubscriptionRepository {
  /**
   * Create a new premium subscription
   * @param {string} userId - User ID
   * @param {string} packageId - Package ID
   * @param {Date} startDate - Subscription start date
   * @param {Date} endDate - Subscription end date
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(userId, packageId, startDate, endDate) {
    try {
      await executeQuery(`
        INSERT INTO UserPremiumSubscriptions 
          (UserId, PackageId, StartDate, EndDate, IsActive, RevivesUsed)
        VALUES 
          (?, ?, ?, ?, 1, 0)
      `, [userId, packageId, startDate, endDate]);
      
      const result = await executeQuery(`
        SELECT * FROM UserPremiumSubscriptions 
        WHERE UserId = ? AND PackageId = ? 
        ORDER BY CreatedAt DESC LIMIT 1
      `, [userId, packageId]);
      
      const subscription = result.recordset[0];
      return {
        id: subscription.Id,
        userId: subscription.UserId,
        packageId: subscription.PackageId,
        startDate: subscription.StartDate,
        endDate: subscription.EndDate,
        isActive: subscription.IsActive,
        revivesUsed: subscription.RevivesUsed,
        createdAt: subscription.CreatedAt,
        updatedAt: subscription.UpdatedAt
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get active subscription for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Active subscription with package details or null
   */
  async getActiveSubscriptionByUser(userId) {
    try {
      const result = await executeQuery(`
        SELECT 
          ups.Id,
          ups.UserId,
          ups.PackageId,
          ups.StartDate,
          ups.EndDate,
          ups.IsActive,
          ups.RevivesUsed,
          ups.CreatedAt,
          ups.UpdatedAt,
          pp.Name as PackageName,
          pp.ScoreBonus,
          pp.ReviveCount
        FROM UserPremiumSubscriptions ups
        INNER JOIN PremiumPackages pp ON ups.PackageId = pp.Id
        WHERE ups.UserId = ?
          AND ups.IsActive = 1
          AND ups.EndDate > NOW()
        ORDER BY ups.EndDate DESC
      `, [userId]);
      
      if (result.recordset.length === 0) {
        return null;
      }

      const sub = result.recordset[0];
      return {
        id: sub.Id,
        userId: sub.UserId,
        packageId: sub.PackageId,
        packageName: sub.PackageName,
        startDate: sub.StartDate,
        endDate: sub.EndDate,
        isActive: sub.IsActive,
        revivesUsed: sub.RevivesUsed,
        reviveCount: sub.ReviveCount,
        scoreBonus: sub.ScoreBonus,
        createdAt: sub.CreatedAt,
        updatedAt: sub.UpdatedAt
      };
    } catch (error) {
      console.error('Error getting active subscription:', error);
      throw error;
    }
  }

  /**
   * Check if subscription is expired
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<boolean>} True if subscription is expired
   */
  async isSubscriptionExpired(subscriptionId) {
    try {
      const result = await executeQuery(`
        SELECT EndDate
        FROM UserPremiumSubscriptions
        WHERE Id = ?
      `, [subscriptionId]);
      
      if (result.recordset.length === 0) {
        return true; // Subscription not found, consider expired
      }

      const endDate = result.recordset[0].EndDate;
      return new Date(endDate) <= new Date();
    } catch (error) {
      console.error('Error checking if subscription is expired:', error);
      throw error;
    }
  }

  /**
   * Update revives used count
   * @param {string} subscriptionId - Subscription ID
   * @param {number} revivesUsed - Number of revives used
   * @returns {Promise<Object>} Updated subscription
   */
  async updateRevivesUsed(subscriptionId, revivesUsed) {
    try {
      await executeQuery(`
        UPDATE UserPremiumSubscriptions
        SET 
          RevivesUsed = ?,
          UpdatedAt = NOW()
        WHERE Id = ?
      `, [revivesUsed, subscriptionId]);
      
      const result = await executeQuery(`
        SELECT * FROM UserPremiumSubscriptions WHERE Id = ?
      `, [subscriptionId]);
      
      if (result.recordset.length === 0) {
        return null;
      }

      const subscription = result.recordset[0];
      return {
        id: subscription.Id,
        userId: subscription.UserId,
        packageId: subscription.PackageId,
        startDate: subscription.StartDate,
        endDate: subscription.EndDate,
        isActive: subscription.IsActive,
        revivesUsed: subscription.RevivesUsed,
        createdAt: subscription.CreatedAt,
        updatedAt: subscription.UpdatedAt
      };
    } catch (error) {
      console.error('Error updating revives used:', error);
      throw error;
    }
  }

  /**
   * Deactivate expired subscriptions
   * @returns {Promise<number>} Number of subscriptions deactivated
   */
  async deactivateExpiredSubscriptions() {
    try {
      const result = await executeQuery(`
        UPDATE UserPremiumSubscriptions
        SET IsActive = 0, UpdatedAt = NOW()
        WHERE IsActive = 1 AND EndDate <= NOW()
      `);
      
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deactivating expired subscriptions:', error);
      throw error;
    }
  }
}

module.exports = new UserPremiumSubscriptionRepository();
