/**
 * Cache Middleware
 * Implements response caching for GET requests
 */

class CacheMiddleware {
  constructor() {
    this.store = new Map();
    this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key from request
   * @param {Object} req - Express request
   * @returns {string} Cache key
   */
  generateKey(req) {
    const userId = req.user ? req.user.userId : 'anonymous';
    const path = req.originalUrl || req.url;
    return `${userId}:${path}`;
  }

  /**
   * Cache middleware factory
   * @param {Object} options - Cache options
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {Function} options.keyGenerator - Custom key generator
   * @returns {Function} Express middleware
   */
  cache(options = {}) {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const keyGenerator = options.keyGenerator || this.generateKey.bind(this);

    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = keyGenerator(req);
      const cached = this.store.get(key);

      // Check if cached and not expired
      if (cached && Date.now() - cached.timestamp < ttl) {
        console.log(`Cache HIT: ${key}`);
        return res.json(cached.data);
      }

      console.log(`Cache MISS: ${key}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.store.set(key, {
            data,
            timestamp: Date.now()
          });
        }
        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Invalidate cache by pattern
   * @param {string|RegExp} pattern - Pattern to match keys
   */
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      this.store.delete(pattern);
      console.log(`Cache invalidated: ${pattern}`);
    } else if (pattern instanceof RegExp) {
      let count = 0;
      for (const key of this.store.keys()) {
        if (pattern.test(key)) {
          this.store.delete(key);
          count++;
        }
      }
      console.log(`Cache invalidated: ${count} entries matching ${pattern}`);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    const size = this.store.size;
    this.store.clear();
    console.log(`Cache cleared: ${size} entries removed`);
  }

  /**
   * Clean expired entries
   */
  cleanExpired() {
    const now = Date.now();
    let count = 0;
    
    for (const [key, value] of this.store.entries()) {
      if (now - value.timestamp >= this.DEFAULT_TTL) {
        this.store.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      console.log(`Cache cleanup: ${count} expired entries removed`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

// Create singleton instance
const cacheMiddleware = new CacheMiddleware();

// Run cleanup every 10 minutes
setInterval(() => {
  cacheMiddleware.cleanExpired();
}, 10 * 60 * 1000);

module.exports = cacheMiddleware;
