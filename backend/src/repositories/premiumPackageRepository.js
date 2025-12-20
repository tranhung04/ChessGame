const sql = require('mssql');
const { getPool } = require('../config/database');

/**
 * Premium Package Repository
 * Handles database operations for premium packages
 */
class PremiumPackageRepository {
  /**
   * Get all active premium packages
   * @returns {Promise<Array>} Array of premium packages
   */
  async getAllPackages() {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .query(`
          SELECT 
            Id,
            Name,
            Price,
            Currency,
            DurationDays,
            ScoreBonus,
            ReviveCount,
            Features,
            IsActive,
            CreatedAt,
            UpdatedAt
          FROM PremiumPackages
          WHERE IsActive = 1
          ORDER BY Price ASC
        `);
      
      return result.recordset.map(pkg => ({
        id: pkg.Id,
        name: pkg.Name,
        price: pkg.Price,
        currency: pkg.Currency,
        durationDays: pkg.DurationDays,
        scoreBonus: pkg.ScoreBonus,
        reviveCount: pkg.ReviveCount,
        features: pkg.Features ? JSON.parse(pkg.Features) : [],
        isActive: pkg.IsActive,
        createdAt: pkg.CreatedAt,
        updatedAt: pkg.UpdatedAt
      }));
    } catch (error) {
      console.error('Error getting all packages:', error);
      throw error;
    }
  }

  /**
   * Get premium package by ID
   * @param {string} packageId - Package ID
   * @returns {Promise<Object|null>} Premium package or null if not found
   */
  async getPackageById(packageId) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('packageId', sql.NVarChar(50), packageId)
        .query(`
          SELECT 
            Id,
            Name,
            Price,
            Currency,
            DurationDays,
            ScoreBonus,
            ReviveCount,
            Features,
            IsActive,
            CreatedAt,
            UpdatedAt
          FROM PremiumPackages
          WHERE Id = @packageId
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }

      const pkg = result.recordset[0];
      return {
        id: pkg.Id,
        name: pkg.Name,
        price: pkg.Price,
        currency: pkg.Currency,
        durationDays: pkg.DurationDays,
        scoreBonus: pkg.ScoreBonus,
        reviveCount: pkg.ReviveCount,
        features: pkg.Features ? JSON.parse(pkg.Features) : [],
        isActive: pkg.IsActive,
        createdAt: pkg.CreatedAt,
        updatedAt: pkg.UpdatedAt
      };
    } catch (error) {
      console.error('Error getting package by ID:', error);
      throw error;
    }
  }

  /**
   * Check if package is active
   * @param {string} packageId - Package ID
   * @returns {Promise<boolean>} True if package is active
   */
  async isPackageActive(packageId) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('packageId', sql.NVarChar(50), packageId)
        .query(`
          SELECT IsActive
          FROM PremiumPackages
          WHERE Id = @packageId
        `);
      
      if (result.recordset.length === 0) {
        return false;
      }

      return result.recordset[0].IsActive === true;
    } catch (error) {
      console.error('Error checking if package is active:', error);
      throw error;
    }
  }
}

module.exports = new PremiumPackageRepository();
