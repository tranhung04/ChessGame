/**
 * Compression Middleware
 * Implements response compression for API responses
 */

const compression = require('compression');

/**
 * Create compression middleware with custom options
 * @returns {Function} Express middleware
 */
function createCompressionMiddleware() {
  return compression({
    // Only compress responses larger than 1KB
    threshold: 1024,
    
    // Compression level (0-9, 6 is default)
    level: 6,
    
    // Filter function to determine what to compress
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Use compression's default filter
      return compression.filter(req, res);
    }
  });
}

module.exports = createCompressionMiddleware;
