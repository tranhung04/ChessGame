-- =============================================
-- ToolChess Database Master Setup Script
-- =============================================
-- Description: Complete database setup including schema, indexes, and seed data
-- Requirements: 14.1-14.9, 15.1-15.5
-- =============================================
-- This script is idempotent and can be run multiple times safely
-- =============================================

SET NOCOUNT ON;
GO

PRINT '========================================';
PRINT 'ToolChess Database Setup';
PRINT 'Starting at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- Step 1: Create Database
-- =============================================
PRINT 'Step 1: Creating database...';
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ToolChessDB')
BEGIN
    CREATE DATABASE ToolChessDB;
    PRINT 'Database ToolChessDB created successfully';
END
ELSE
BEGIN
    PRINT 'Database ToolChessDB already exists';
END
GO

USE ToolChessDB;
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 2: Creating tables...';
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- Step 2: Create Tables
-- =============================================

-- 2.1 Users Table
PRINT '2.1 Creating Users table...';
GO
:r schema/01_create_users_table.sql
PRINT '';
GO

-- 2.2 RefreshTokens Table
PRINT '2.2 Creating RefreshTokens table...';
GO
:r schema/02_create_refresh_tokens_table.sql
PRINT '';
GO

-- 2.3 PremiumPackages Table
PRINT '2.3 Creating PremiumPackages table...';
GO
:r schema/03_create_premium_packages_table.sql
PRINT '';
GO

-- 2.4 UserPremiumSubscriptions Table
PRINT '2.4 Creating UserPremiumSubscriptions table...';
GO
:r schema/04_create_user_premium_subscriptions_table.sql
PRINT '';
GO

-- 2.5 Payments Table
PRINT '2.5 Creating Payments table...';
GO
:r schema/05_create_payments_table.sql
PRINT '';
GO

-- 2.6 GameSessions Table
PRINT '2.6 Creating GameSessions table...';
GO
:r schema/06_create_game_sessions_table.sql
PRINT '';
GO

-- 2.7 GameMoves Table
PRINT '2.7 Creating GameMoves table...';
GO
:r schema/07_create_game_moves_table.sql
PRINT '';
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 3: Creating indexes...';
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- Step 3: Create Indexes
-- =============================================

-- 3.1 Users Indexes
PRINT '3.1 Creating Users indexes...';
GO
:r indexes/01_create_users_indexes.sql
PRINT '';
GO

-- 3.2 RefreshTokens Indexes
PRINT '3.2 Creating RefreshTokens indexes...';
GO
:r indexes/02_create_refresh_tokens_indexes.sql
PRINT '';
GO

-- 3.3 UserPremiumSubscriptions Indexes
PRINT '3.3 Creating UserPremiumSubscriptions indexes...';
GO
:r indexes/03_create_subscriptions_indexes.sql
PRINT '';
GO

-- 3.4 Payments Indexes
PRINT '3.4 Creating Payments indexes...';
GO
:r indexes/04_create_payments_indexes.sql
PRINT '';
GO

-- 3.5 GameSessions Indexes
PRINT '3.5 Creating GameSessions indexes...';
GO
:r indexes/05_create_game_sessions_indexes.sql
PRINT '';
GO

-- 3.6 GameMoves Indexes
PRINT '3.6 Creating GameMoves indexes...';
GO
:r indexes/06_create_game_moves_indexes.sql
PRINT '';
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 4: Seeding data...';
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- Step 4: Seed Data
-- =============================================

-- 4.1 Premium Packages
PRINT '4.1 Seeding premium packages...';
GO
:r seed/01_seed_premium_packages.sql
PRINT '';
GO

-- 4.2 Test Users (Development Only)
PRINT '4.2 Seeding test users...';
PRINT 'WARNING: Test users are for development only!';
GO
:r seed/02_seed_test_users.sql
PRINT '';
GO

-- =============================================
-- Step 5: Verification
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Step 5: Verification';
PRINT '========================================';
PRINT '';
GO

-- Verify tables
PRINT 'Tables created:';
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

-- Verify indexes
PRINT '';
PRINT 'Total indexes created:';
SELECT 
    COUNT(*) AS IndexCount
FROM sys.indexes
WHERE object_id IN (
    SELECT object_id 
    FROM sys.tables 
    WHERE schema_id = SCHEMA_ID('dbo')
)
AND index_id > 0;
GO

-- Verify premium packages
PRINT '';
PRINT 'Premium packages:';
SELECT COUNT(*) AS PackageCount FROM dbo.PremiumPackages;
GO

-- Verify test users
PRINT '';
PRINT 'Test users:';
SELECT COUNT(*) AS TestUserCount FROM dbo.Users WHERE Email LIKE '%@test.toolchess.com';
GO

-- =============================================
-- Completion
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Database setup completed successfully!';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Update your backend .env file with database connection string';
PRINT '2. Test database connectivity from your application';
PRINT '3. Run backend application to verify integration';
PRINT '';
PRINT 'Test credentials:';
PRINT '  Email: testuser1@test.toolchess.com';
PRINT '  Password: TestPass123!';
PRINT '';
GO
