const mysql = require('mysql2/promise');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'ToolChessDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Connection pool
let pool = null;

/**
 * Get database connection pool
 * Creates pool if it doesn't exist
 */
async function getPool() {
  if (!pool) {
    pool = mysql.createPool(config);
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
    const [rows] = await testPool.query('SELECT 1 AS test');
    
    if (rows[0].test === 1) {
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
    await pool.end();
    pool = null;
    console.log('✓ Database connection pool closed');
  }
}

/**
 * Execute a query with parameters
 */
async function executeQuery(query, params = []) {
  try {
    const dbPool = await getPool();
    const [rows] = await dbPool.query(query, params);
    return { recordset: rows, rowsAffected: [rows.affectedRows || rows.length] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a stored procedure (MySQL uses CALL)
 */
async function executeProcedure(procedureName, params = []) {
  try {
    const dbPool = await getPool();
    const placeholders = params.map(() => '?').join(', ');
    const query = `CALL ${procedureName}(${placeholders})`;
    const [rows] = await dbPool.query(query, params);
    return { recordset: rows[0] || [], rowsAffected: [rows.affectedRows || 0] };
  } catch (error) {
    console.error('Database procedure error:', error);
    throw error;
  }
}

module.exports = {
  mysql,
  getPool,
  testDatabaseConnection,
  closePool,
  executeQuery,
  executeProcedure,
  config
};
