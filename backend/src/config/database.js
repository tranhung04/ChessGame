const sql = require('mssql');

// Database configuration
const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'ToolChessDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Add port only if specified and not empty
if (process.env.DB_PORT && process.env.DB_PORT.trim() !== '') {
  config.port = parseInt(process.env.DB_PORT);
}

// Connection pool
let pool = null;

/**
 * Get database connection pool
 * Creates pool if it doesn't exist
 */
async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✓ Database connection pool created');
  }
  return pool;
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  try {
    const testPool = await getPool();
    const result = await testPool.request().query('SELECT 1 AS test');
    
    if (result.recordset[0].test === 1) {
      console.log('✓ Database connection test successful');
      return true;
    }
    
    throw new Error('Database connection test failed');
  } catch (error) {
    console.error('✗ Database connection test failed:', error.message);
    throw error;
  }
}

/**
 * Close database connection pool
 */
async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('✓ Database connection pool closed');
  }
}

/**
 * Execute a query with parameters
 */
async function executeQuery(query, params = {}) {
  try {
    const dbPool = await getPool();
    const request = dbPool.request();
    
    // Add parameters to request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a stored procedure
 */
async function executeProcedure(procedureName, params = {}) {
  try {
    const dbPool = await getPool();
    const request = dbPool.request();
    
    // Add parameters to request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error('Database procedure error:', error);
    throw error;
  }
}

module.exports = {
  sql,
  getPool,
  testDatabaseConnection,
  closePool,
  executeQuery,
  executeProcedure,
  config
};
