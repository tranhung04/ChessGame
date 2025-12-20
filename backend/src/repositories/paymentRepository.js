const sql = require('mssql');
const { getPool } = require('../config/database');

/**
 * Payment Repository
 * Handles all database operations for payments
 */
class PaymentRepository {
  /**
   * Create a new payment record
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.userId - User ID
   * @param {string} paymentData.orderId - Unique order ID
   * @param {string} paymentData.packageId - Premium package ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (default: VND)
   * @param {string} paymentData.status - Payment status (default: pending)
   * @param {string} paymentData.paymentMethod - Payment method (default: vnpay)
   * @returns {Promise<Object>} Created payment record
   */
  async createPayment(paymentData) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, paymentData.userId)
        .input('orderId', sql.NVarChar(100), paymentData.orderId)
        .input('packageId', sql.NVarChar(50), paymentData.packageId)
        .input('amount', sql.Decimal(10, 2), paymentData.amount)
        .input('currency', sql.NVarChar(10), paymentData.currency || 'VND')
        .input('status', sql.NVarChar(20), paymentData.status || 'pending')
        .input('paymentMethod', sql.NVarChar(50), paymentData.paymentMethod || 'vnpay')
        .query(`
          INSERT INTO Payments (UserId, OrderId, PackageId, Amount, Currency, Status, PaymentMethod, CreatedAt, UpdatedAt)
          OUTPUT INSERTED.*
          VALUES (@userId, @orderId, @packageId, @amount, @currency, @status, @paymentMethod, GETUTCDATE(), GETUTCDATE())
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Update payment status and VNPay data
   * @param {string} orderId - Order ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.status - New payment status
   * @param {Object} updateData.vnpayData - VNPay response data
   * @returns {Promise<Object>} Updated payment record
   */
  async updatePaymentStatus(orderId, updateData) {
    try {
      const pool = await getPool();
      const { status, vnpayData } = updateData;

      const result = await pool.request()
        .input('orderId', sql.NVarChar(100), orderId)
        .input('status', sql.NVarChar(20), status)
        .input('vnpayData', sql.NVarChar(sql.MAX), JSON.stringify(vnpayData))
        .input('completedAt', sql.DateTime2, status === 'completed' ? new Date() : null)
        .query(`
          UPDATE Payments
          SET Status = @status,
              VnpayData = @vnpayData,
              CompletedAt = @completedAt,
              UpdatedAt = GETUTCDATE()
          OUTPUT INSERTED.*
          WHERE OrderId = @orderId
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Get payment by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object|null>} Payment record or null if not found
   */
  async getPaymentByOrderId(orderId) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('orderId', sql.NVarChar(100), orderId)
        .query(`
          SELECT p.*, pp.Name as PackageName, pp.DurationDays, pp.ScoreBonus, pp.ReviveCount
          FROM Payments p
          LEFT JOIN PremiumPackages pp ON p.PackageId = pp.Id
          WHERE p.OrderId = @orderId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error getting payment by order ID:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object|null>} Payment record or null if not found
   */
  async getPaymentById(paymentId) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('paymentId', sql.UniqueIdentifier, paymentId)
        .query(`
          SELECT p.*, pp.Name as PackageName, pp.DurationDays, pp.ScoreBonus, pp.ReviveCount
          FROM Payments p
          LEFT JOIN PremiumPackages pp ON p.PackageId = pp.Id
          WHERE p.Id = @paymentId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  /**
   * Get user payment history
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @returns {Promise<Object>} Payment history with pagination
   */
  async getUserPaymentHistory(userId, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      const pool = await getPool();

      // Get total count
      const countResult = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .query(`
          SELECT COUNT(*) as total
          FROM Payments
          WHERE UserId = @userId
        `);

      const total = countResult.recordset[0].total;

      // Get paginated payments
      const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT p.*, pp.Name as PackageName, pp.DurationDays, pp.ScoreBonus
          FROM Payments p
          LEFT JOIN PremiumPackages pp ON p.PackageId = pp.Id
          WHERE p.UserId = @userId
          ORDER BY p.CreatedAt DESC
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
        `);

      return {
        payments: result.recordset,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user payment history:', error);
      throw error;
    }
  }

  /**
   * Get pending payments older than specified minutes
   * @param {number} minutes - Minutes threshold
   * @returns {Promise<Array>} Array of expired pending payments
   */
  async getExpiredPendingPayments(minutes = 15) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('minutes', sql.Int, minutes)
        .query(`
          SELECT *
          FROM Payments
          WHERE Status = 'pending'
            AND DATEDIFF(MINUTE, CreatedAt, GETUTCDATE()) > @minutes
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting expired pending payments:', error);
      throw error;
    }
  }

  /**
   * Mark expired pending payments as expired
   * @param {number} minutes - Minutes threshold (default: 15)
   * @returns {Promise<number>} Number of payments marked as expired
   */
  async markExpiredPayments(minutes = 15) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('minutes', sql.Int, minutes)
        .query(`
          UPDATE Payments
          SET Status = 'expired',
              UpdatedAt = GETUTCDATE()
          WHERE Status = 'pending'
            AND DATEDIFF(MINUTE, CreatedAt, GETUTCDATE()) > @minutes
        `);

      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error marking expired payments:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Payment statistics
   */
  async getUserPaymentStats(userId) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .query(`
          SELECT 
            COUNT(*) as totalPayments,
            SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) as completedPayments,
            SUM(CASE WHEN Status = 'completed' THEN Amount ELSE 0 END) as totalSpent,
            MAX(CASE WHEN Status = 'completed' THEN CreatedAt END) as lastPaymentDate
          FROM Payments
          WHERE UserId = @userId
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error getting user payment stats:', error);
      throw error;
    }
  }
}

module.exports = new PaymentRepository();
