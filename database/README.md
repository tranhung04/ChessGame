# ToolChess Database Setup

This directory contains all SQL Server database setup scripts for the ToolChess application.

## Directory Structure

- `schema/` - Table creation scripts
- `indexes/` - Index creation scripts
- `seed/` - Data seeding scripts
- `migrations/` - Version-controlled migration scripts
- `setup.sql` - Master setup script that runs all scripts in order

## Setup Instructions

### Prerequisites

- SQL Server 2019 or later
- SQL Server Management Studio (SSMS) or Azure Data Studio
- Appropriate database permissions (CREATE DATABASE, CREATE TABLE, etc.)

### Quick Setup

1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Open `setup.sql`
4. Update the database name if needed (default: ToolChessDB)
5. Execute the script

### Manual Setup

If you prefer to run scripts individually:

1. Create the database: `CREATE DATABASE ToolChessDB;`
2. Run all scripts in `schema/` directory
3. Run all scripts in `indexes/` directory
4. Run all scripts in `seed/` directory

### Verification

After setup, verify the installation:

```sql
USE ToolChessDB;

-- Check tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- Check premium packages
SELECT * FROM PremiumPackages;

-- Check test users
SELECT Id, Username, Email FROM Users;
```

## Environment Configuration

### Development
- Database: ToolChessDB_Dev
- Test users included
- Sample data included

### Staging
- Database: ToolChessDB_Staging
- Test users included
- No sample data

### Production
- Database: ToolChessDB
- No test users
- No sample data

## Maintenance

### Backup
```sql
BACKUP DATABASE ToolChessDB TO DISK = 'C:\Backups\ToolChessDB.bak';
```

### Restore
```sql
RESTORE DATABASE ToolChessDB FROM DISK = 'C:\Backups\ToolChessDB.bak';
```

### Clean Up (Development Only)
```sql
USE master;
DROP DATABASE IF EXISTS ToolChessDB;
```

## Notes

- All scripts are idempotent (can be run multiple times safely)
- Foreign key constraints ensure referential integrity
- Indexes are optimized for common query patterns
- Premium packages are pre-configured with Vietnamese pricing
