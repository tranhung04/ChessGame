const sql = require('mssql');
const { getPool } = require('../config/database');

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
      const pool = await getPool();
      const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('packageId', sql.NVarChar(50), packageId)
        .input('startDate', sql.DateTime2, startDate)
        .input('endDate', sql.DateTime2, endDate)
        .query(`
          INSERT INTO UserPremiumSubscriptions 
            (UserId, PackageId, StartDate, EndDate, IsActive, RevivesUsed)
          OUTPUT INSERTED.*
          VALUES 
            (@userId, @packageId, @startDate, @endDate, 1, 0)
        `);
      
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
      const pool = await getPool();
      const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('currentDate', sql.DateTime2, new Date())
        .query(`
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
          WHERE ups.UserId = @userId
            AND ups.IsActive = 1
            AND ups.EndDate > @currentDate
          ORDER BY ups.EndDate DESC
        `);
      
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
      const pool = await getPool();
      const result = await pool.request()
        .input('subscriptionId', sql.UniqueIdentifier, subscriptionId)
        .input('currentDate', sql.DateTime2, new Date())
        .query(`
          SELECT EndDate
          FROM UserPremiumSubscriptions
          WHERE Id = @subscriptionId
        `);
      
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
      const pool = await getPool();
      const result = await pool.request()
        .input('subscriptionId', sql.UniqueIdentifier, subscriptionId)
        .input('revivesUsed', sql.Int, revivesUsed)
        .input('updatedAt', sql.DateTime2, new Date())
        .query(`
          UPDATE UserPremiumSubscriptions
          SET 
            RevivesUsed = @revivesUsed,
            UpdatedAt = @updatedAt
          OUTPUT INSERTED.*
          WHERE Id = @subscriptionId
        `);
      
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
      const pool = await getPool();
      const result = await pool.request()
        .input('currentDate', sql.DateTime2, new Date())
        .query(`
          UPDATE UserPremiumSubscriptions
          SET IsActive = 0, UpdatedAt = GETUTCDATE()
          WHERE IsActive = 1 AND EndDate <= @currentDate
        `);
      
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deactivating expired subscriptions:', error);
      throw error;
    }
  }
}

module.exports = new UserPremiumSubscriptionRepository();
