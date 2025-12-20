# ToolChess Database Quick Start Guide

## Prerequisites

- SQL Server 2019 or later installed
- SQL Server Management Studio (SSMS) or Azure Data Studio
- Appropriate permissions to create databases

## Option 1: Quick Setup (Recommended)

1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Open the file: `setup_simple.sql`
4. Execute the script (F5 or click Execute)
5. Wait for completion (should take less than 1 minute)

That's it! Your database is ready.

## Option 2: Step-by-Step Setup

If you prefer to run scripts individually:

1. **Create Database**
   ```sql
   CREATE DATABASE ToolChessDB;
   GO
   USE ToolChessDB;
   GO
   ```

2. **Create Tables**
   - Run all scripts in `schema/` folder in order (01-07)

3. **Create Indexes**
   - Run all scripts in `indexes/` folder in order (01-06)

4. **Seed Data**
   - Run all scripts in `seed/` folder in order (01-02)

## Verification

After setup, run the verification script:

```sql
-- In SSMS, open and execute:
verify.sql
```

This will check:
- All tables created
- All indexes created
- Premium packages seeded
- Test users created
- Data integrity

## Test Credentials

After setup, you can use these test accounts:

**Regular User:**
- Email: `testuser1@test.toolchess.com`
- Password: `TestPass123!`

**Premium User (with Pro subscription):**
- Email: `premium@test.toolchess.com`
- Password: `TestPass123!`

**Admin User:**
- Email: `admin@test.toolchess.com`
- Password: `TestPass123!`

## Connection String

Update your backend `.env` file with:

```env
# For SQL Server Authentication
DATABASE_URL=Server=localhost,1433;Database=ToolChessDB;User Id=sa;Password=YourPassword;Encrypt=true;TrustServerCertificate=true;

# For Windows Authentication
DATABASE_URL=Server=localhost;Database=ToolChessDB;Trusted_Connection=yes;Encrypt=true;TrustServerCertificate=true;
```

## Common Issues

### Issue: Cannot connect to SQL Server

**Solution:**
1. Ensure SQL Server is running
2. Check SQL Server Configuration Manager
3. Enable TCP/IP protocol
4. Restart SQL Server service

### Issue: Login failed for user

**Solution:**
1. Verify SQL Server authentication mode (mixed mode)
2. Check user credentials
3. Ensure user has appropriate permissions

### Issue: Database already exists

**Solution:**
Run the cleanup script first:
```sql
-- WARNING: This deletes the database!
-- Run: cleanup.sql
```

## Next Steps

1. ✅ Database setup complete
2. Configure backend connection string
3. Test backend connectivity
4. Start implementing backend API endpoints

## Cleanup (Development Only)

To remove the database completely:

```sql
-- WARNING: This deletes everything!
-- Run: cleanup.sql
```

## Production Deployment

For production:

1. **DO NOT** run `seed/02_seed_test_users.sql`
2. Use strong passwords
3. Enable proper encryption
4. Set up regular backups
5. Configure appropriate user permissions
6. Use environment-specific database names

## Support

If you encounter issues:

1. Check the verification script output
2. Review SQL Server error logs
3. Ensure all prerequisites are met
4. Check firewall settings for SQL Server port (1433)

## Database Schema Overview

```
Users (authentication)
  ├── RefreshTokens (JWT tokens)
  └── UserPremiumSubscriptions (premium status)
        └── PremiumPackages (package definitions)
  ├── Payments (payment records)
  └── GameSessions (game history)
        └── GameMoves (move history - optional)
```

## Performance Notes

- All tables have appropriate indexes
- Foreign keys ensure referential integrity
- Check constraints validate data
- Indexes optimized for common queries:
  - User lookup by email/username
  - Game history by user
  - Leaderboard queries
  - Payment status checks
