const { createError } = require('./errorHandler');

/**
 * 404 Not Found handler
 * Catches all requests that don't match any routes
 */
function notFoundHandler(req, res, next) {
  const error = createError.notFound(
    `Route ${req.method} ${req.path} not found`,
    {
      method: req.method,
      path: req.path
    }
  );
  next(error);
}

module.exports = {
  notFoundHandler
};
