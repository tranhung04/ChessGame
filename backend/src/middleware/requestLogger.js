/**
 * Custom request logger middleware
 * Logs important request information
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log request
  console.log(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

module.exports = {
  requestLogger
};
