require('dotenv').config();
const { getPool } = require('./src/config/database');

async function checkDatabase() {
  console.log('=== Checking Database State ===\n');
  
  try {
    // Connect to database
    console.log('Connecting to database...');
    const pool = await getPool();
    console.log('✓ Connected\n');

    // Check premium packages
    console.log('Checking premium packages...');
    const packagesResult = await pool.request().query('SELECT * FROM PremiumPackages');
    console.log(`✓ Found ${packagesResult.recordset.length} premium packages:`);
    packagesResult.recordset.forEach(pkg => {
      console.log(`  - ${pkg.Id}: ${pkg.Name} (${pkg.Price} ${pkg.Currency}, Active: ${pkg.IsActive})`);
    });
    console.log();

    // Check users
    console.log('Checking users...');
    const usersResult = await pool.request().query('SELECT TOP 5 Id, Username, Email FROM Users ORDER BY CreatedAt DESC');
    console.log(`✓ Found ${usersResult.recordset.length} recent users:`);
    usersResult.recordset.forEach(user => {
      console.log(`  - ${user.Username} (${user.Email})`);
    });
    console.log();

    // Check payments
    console.log('Checking payments...');
    const paymentsResult = await pool.request().query('SELECT TOP 5 OrderId, Status, Amount, CreatedAt FROM Payments ORDER BY CreatedAt DESC');
    console.log(`✓ Found ${paymentsResult.recordset.length} recent payments:`);
    paymentsResult.recordset.forEach(payment => {
      console.log(`  - ${payment.OrderId}: ${payment.Status} (${payment.Amount})`);
    });
    console.log();

    // Check subscriptions
    console.log('Checking subscriptions...');
    const subsResult = await pool.request().query('SELECT TOP 5 * FROM UserPremiumSubscriptions ORDER BY CreatedAt DESC');
    console.log(`✓ Found ${subsResult.recordset.length} recent subscriptions:`);
    subsResult.recordset.forEach(sub => {
      console.log(`  - User: ${sub.UserId}, Package: ${sub.PackageId}, Active: ${sub.IsActive}`);
    });
    console.log();

    console.log('=== Database Check Complete ===');
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    process.exit(1);
  }
}

checkDatabase();
