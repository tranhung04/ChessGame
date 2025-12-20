/**
 * Database connection test utility
 * Run this script to verify database connectivity
 */
require('dotenv').config();
const { testDatabaseConnection, closePool, executeQuery } = require('../config/database');

async function runConnectionTest() {
  console.log('='.repeat(50));
  console.log('ToolChess Backend - Database Connection Test');
  console.log('='.repeat(50));
  console.log('');
  
  console.log('Configuration:');
  console.log(`  Server: ${process.env.DB_SERVER}:${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_DATABASE}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log('');

  try {
    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...');
    await testDatabaseConnection();
    console.log('✓ Basic connection test passed');
    console.log('');

    // Test 2: Query execution
    console.log('Test 2: Testing query execution...');
    const result = await executeQuery('SELECT GETDATE() AS currentTime, @@VERSION AS version');
    console.log('✓ Query execution test passed');
    console.log(`  Current Time: ${result.recordset[0].currentTime}`);
    console.log(`  SQL Server Version: ${result.recordset[0].version.split('\n')[0]}`);
    console.log('');

    // Test 3: Check if database exists
    console.log('Test 3: Checking if database exists...');
    const dbCheck = await executeQuery(
      `SELECT name FROM sys.databases WHERE name = @dbName`,
      { dbName: process.env.DB_DATABASE }
    );
    
    if (dbCheck.recordset.length > 0) {
      console.log(`✓ Database '${process.env.DB_DATABASE}' exists`);
    } else {
      console.log(`✗ Database '${process.env.DB_DATABASE}' does not exist`);
      console.log('  Please create the database first using the scripts in /database folder');
    }
    console.log('');

    // Test 4: Check if tables exist
    console.log('Test 4: Checking for ToolChess tables...');
    const tableCheck = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    if (tableCheck.recordset.length > 0) {
      console.log(`✓ Found ${tableCheck.recordset.length} tables:`);
      tableCheck.recordset.forEach(row => {
        console.log(`    - ${row.TABLE_NAME}`);
      });
    } else {
      console.log('✗ No tables found');
      console.log('  Please run the schema creation scripts in /database folder');
    }
    console.log('');

    console.log('='.repeat(50));
    console.log('✓ All connection tests completed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('');
    console.error('='.repeat(50));
    console.error('✗ Connection test failed!');
    console.error('='.repeat(50));
    console.error('');
    console.error('Error details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    console.error('');
    console.error('Common issues:');
    console.error('  1. SQL Server is not running');
    console.error('  2. Incorrect credentials in .env file');
    console.error('  3. Firewall blocking connection');
    console.error('  4. Database does not exist');
    console.error('');
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the test
runConnectionTest();
