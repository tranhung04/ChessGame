/**
 * Query Optimizer Utilities
 * Provides utilities for optimizing database queries
 */

/**
 * Build optimized pagination query
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {number} options.maxLimit - Maximum allowed limit
 * @returns {Object} Pagination parameters
 */
function buildPagination(options = {}) {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(
    parseInt(options.limit) || 10,
    options.maxLimit || 100
  );
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
}

/**
 * Build date filter for time-based queries
 * @param {string} period - Time period (all, daily, weekly, monthly)
 * @returns {string} SQL date filter clause
 */
function buildDateFilter(period) {
  switch (period) {
    case 'daily':
      return 'AND CreatedAt >= DATEADD(day, -1, GETUTCDATE())';
    case 'weekly':
      return 'AND CreatedAt >= DATEADD(week, -1, GETUTCDATE())';
    case 'monthly':
      return 'AND CreatedAt >= DATEADD(month, -1, GETUTCDATE())';
    case 'yearly':
      return 'AND CreatedAt >= DATEADD(year, -1, GETUTCDATE())';
    default:
      return '';
  }
}

/**
 * Build dynamic WHERE clause from filters
 * @param {Object} filters - Filter object
 * @param {Object} allowedFields - Map of allowed fields to SQL columns
 * @returns {Object} WHERE clause and parameters
 */
function buildWhereClause(filters, allowedFields) {
  const conditions = [];
  const parameters = {};

  for (const [key, value] of Object.entries(filters)) {
    if (allowedFields[key] && value !== undefined && value !== null) {
      const sqlColumn = allowedFields[key];
      conditions.push(`${sqlColumn} = @${key}`);
      parameters[key] = value;
    }
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return { whereClause, parameters };
}

/**
 * Build dynamic ORDER BY clause
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc, desc)
 * @param {Object} allowedFields - Map of allowed fields to SQL columns
 * @param {string} defaultSort - Default sort clause
 * @returns {string} ORDER BY clause
 */
function buildOrderByClause(sortBy, sortOrder, allowedFields, defaultSort) {
  if (!sortBy || !allowedFields[sortBy]) {
    return defaultSort;
  }

  const sqlColumn = allowedFields[sortBy];
  const order = sortOrder && sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  
  return `ORDER BY ${sqlColumn} ${order}`;
}

/**
 * Optimize query with hints
 * @param {string} query - SQL query
 * @param {Object} hints - Query hints
 * @returns {string} Optimized query
 */
function addQueryHints(query, hints = {}) {
  let optimizedQuery = query;

  // Add NOLOCK hint for read queries (reduces locking)
  if (hints.nolock) {
    optimizedQuery = optimizedQuery.replace(
      /FROM\s+(\w+)/gi,
      'FROM $1 WITH (NOLOCK)'
    );
  }

  // Add MAXDOP hint for parallel execution
  if (hints.maxdop) {
    optimizedQuery += ` OPTION (MAXDOP ${hints.maxdop})`;
  }

  // Add RECOMPILE hint for queries with varying parameters
  if (hints.recompile) {
    optimizedQuery += ' OPTION (RECOMPILE)';
  }

  return optimizedQuery;
}

/**
 * Calculate total pages
 * @param {number} total - Total items
 * @param {number} limit - Items per page
 * @returns {number} Total pages
 */
function calculateTotalPages(total, limit) {
  return Math.ceil(total / limit);
}

/**
 * Build pagination response
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
function buildPaginationResponse(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: calculateTotalPages(total, limit),
    hasNext: page < calculateTotalPages(total, limit),
    hasPrev: page > 1
  };
}

/**
 * Batch process items
 * @param {Array} items - Items to process
 * @param {number} batchSize - Batch size
 * @param {Function} processor - Async processor function
 * @returns {Promise<Array>} Processed results
 */
async function batchProcess(items, batchSize, processor) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Debounce function for rate limiting
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

module.exports = {
  buildPagination,
  buildDateFilter,
  buildWhereClause,
  buildOrderByClause,
  addQueryHints,
  calculateTotalPages,
  buildPaginationResponse,
  batchProcess,
  debounce
};
