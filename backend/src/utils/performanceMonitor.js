/**
 * Performance Monitor
 * Tracks and logs performance metrics for API endpoints
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.slowQueryThreshold = 1000; // 1 second
  }

  /**
   * Middleware to track request performance
   * @returns {Function} Express middleware
   */
  trackRequest() {
    return (req, res, next) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      // Store original end function
      const originalEnd = res.end;

      // Override end function to capture metrics
      res.end = (...args) => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        // Log slow requests
        if (duration > this.slowQueryThreshold) {
          console.warn(`SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
        }

        // Store metrics
        this.recordMetric({
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          memoryDelta,
          timestamp: new Date().toISOString()
        });

        // Call original end
        originalEnd.apply(res, args);
      };

      next();
    };
  }

  /**
   * Record a metric
   * @param {Object} metric - Metric data
   */
  recordMetric(metric) {
    const key = `${metric.method}:${metric.path}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        avgDuration: 0,
        errors: 0,
        lastAccessed: null
      });
    }

    const stats = this.metrics.get(key);
    stats.count++;
    stats.totalDuration += metric.duration;
    stats.minDuration = Math.min(stats.minDuration, metric.duration);
    stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
    stats.avgDuration = stats.totalDuration / stats.count;
    stats.lastAccessed = metric.timestamp;

    if (metric.statusCode >= 400) {
      stats.errors++;
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    const stats = {};
    
    for (const [key, value] of this.metrics.entries()) {
      stats[key] = {
        ...value,
        errorRate: value.count > 0 ? (value.errors / value.count * 100).toFixed(2) + '%' : '0%'
      };
    }

    return stats;
  }

  /**
   * Get slow endpoints
   * @param {number} threshold - Duration threshold in ms
   * @returns {Array} Slow endpoints
   */
  getSlowEndpoints(threshold = 1000) {
    const slow = [];
    
    for (const [key, value] of this.metrics.entries()) {
      if (value.avgDuration > threshold) {
        slow.push({
          endpoint: key,
          avgDuration: value.avgDuration,
          maxDuration: value.maxDuration,
          count: value.count
        });
      }
    }

    return slow.sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * Get endpoints with high error rates
   * @param {number} threshold - Error rate threshold (0-1)
   * @returns {Array} High error endpoints
   */
  getHighErrorEndpoints(threshold = 0.05) {
    const highError = [];
    
    for (const [key, value] of this.metrics.entries()) {
      const errorRate = value.errors / value.count;
      if (errorRate > threshold) {
        highError.push({
          endpoint: key,
          errorRate: (errorRate * 100).toFixed(2) + '%',
          errors: value.errors,
          total: value.count
        });
      }
    }

    return highError.sort((a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate));
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.clear();
    console.log('Performance metrics reset');
  }

  /**
   * Get system metrics
   * @returns {Object} System metrics
   */
  getSystemMetrics() {
    const memory = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memory: {
        heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        rss: (memory.rss / 1024 / 1024).toFixed(2) + ' MB',
        external: (memory.external / 1024 / 1024).toFixed(2) + ' MB'
      },
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime)
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    };
  }

  /**
   * Format uptime in human-readable format
   * @param {number} seconds - Uptime in seconds
   * @returns {string} Formatted uptime
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Generate performance report
   * @returns {Object} Complete performance report
   */
  generateReport() {
    return {
      system: this.getSystemMetrics(),
      endpoints: this.getStats(),
      slowEndpoints: this.getSlowEndpoints(),
      highErrorEndpoints: this.getHighErrorEndpoints(),
      summary: {
        totalEndpoints: this.metrics.size,
        totalRequests: Array.from(this.metrics.values()).reduce((sum, v) => sum + v.count, 0),
        totalErrors: Array.from(this.metrics.values()).reduce((sum, v) => sum + v.errors, 0)
      }
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
