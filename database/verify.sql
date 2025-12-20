-- =============================================
-- ToolChess Database Verification Script
-- =============================================
-- Description: Verify database setup is correct
-- Run this after setup to ensure everything is working
-- =============================================

USE ToolChessDB;
GO

SET NOCOUNT ON;
GO

PRINT '========================================';
PRINT 'ToolChess Database Verification';
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- 1. Verify Tables
-- =============================================
PRINT '1. Verifying tables...';
PRINT '';
GO

DECLARE @ExpectedTables INT = 7;
DECLARE @ActualTables INT;

SELECT @ActualTables = COUNT(*)
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo';

PRINT 'Expected tables: ' + CAST(@ExpectedTables AS VARCHAR);
PRINT 'Actual tables: ' + CAST(@ActualTables AS VARCHAR);

IF @ActualTables = @ExpectedTables
    PRINT '✓ All tables created successfully';
ELSE
    PRINT '✗ Table count mismatch!';

PRINT '';
PRINT 'Tables:';
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;
GO

PRINT '';
GO

-- =============================================
-- 2. Verify Foreign Keys
-- =============================================
PRINT '2. Verifying foreign key constraints...';
PRINT '';
GO

SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable
FROM sys.foreign_keys fk
ORDER BY TableName;
GO

PRINT '';
GO

-- =============================================
-- 3. Verify Indexes
-- =============================================
PRINT '3. Verifying indexes...';
PRINT '';
GO

SELECT 
    t.name AS TableName,
    COUNT(i.index_id) AS IndexCount
FROM sys.tables t
LEFT JOIN sys.indexes i ON t.object_id = i.object_id
WHERE t.schema_id = SCHEMA_ID('dbo')
AND i.index_id > 0
GROUP BY t.name
ORDER BY t.name;
GO

PRINT '';
GO

-- =============================================
-- 4. Verify Premium Packages
-- =============================================
PRINT '4. Verifying premium packages...';
PRINT '';
GO

DECLARE @ExpectedPackages INT = 4;
DECLARE @ActualPackages INT;

SELECT @ActualPackages = COUNT(*) FROM dbo.PremiumPackages;

PRINT 'Expected packages: ' + CAST(@ExpectedPackages AS VARCHAR);
PRINT 'Actual packages: ' + CAST(@ActualPackages AS VARCHAR);

IF @ActualPackages = @ExpectedPackages
    PRINT '✓ All premium packages seeded';
ELSE
    PRINT '✗ Premium package count mismatch!';

PRINT '';
SELECT 
    Id,
    Name,
    Price,
    Currency,
    DurationDays,
    ScoreBonus,
    ReviveCount,
    IsActive
FROM dbo.PremiumPackages
ORDER BY Price;
GO

PRINT '';
GO

-- =============================================
-- 5. Verify Test Users
-- =============================================
PRINT '5. Verifying test users...';
PRINT '';
GO

DECLARE @ExpectedUsers INT = 4;
DECLARE @ActualUsers INT;

SELECT @ActualUsers = COUNT(*) 
FROM dbo.Users 
WHERE Email LIKE '%@test.toolchess.com';

PRINT 'Expected test users: ' + CAST(@ExpectedUsers AS VARCHAR);
PRINT 'Actual test users: ' + CAST(@ActualUsers AS VARCHAR);

IF @ActualUsers = @ExpectedUsers
    PRINT '✓ All test users created';
ELSE
    PRINT '✗ Test user count mismatch!';

PRINT '';
SELECT 
    Username,
    Email,
    IsEmailVerified,
    CreatedAt
FROM dbo.Users
WHERE Email LIKE '%@test.toolchess.com'
ORDER BY Username;
GO

PRINT '';
GO

-- =============================================
-- 6. Verify Premium Subscription
-- =============================================
PRINT '6. Verifying premium subscription...';
PRINT '';
GO

SELECT 
    u.Username,
    u.Email,
    pp.Name AS PackageName,
    ups.StartDate,
    ups.EndDate,
    ups.IsActive,
    ups.RevivesUsed
FROM dbo.UserPremiumSubscriptions ups
JOIN dbo.Users u ON ups.UserId = u.Id
JOIN dbo.PremiumPackages pp ON ups.PackageId = pp.Id
WHERE u.Email LIKE '%@test.toolchess.com';
GO

PRINT '';
GO

-- =============================================
-- 7. Test Data Integrity
-- =============================================
PRINT '7. Testing data integrity...';
PRINT '';
GO

-- Test inserting a game session
DECLARE @TestUserId UNIQUEIDENTIFIER;
SELECT TOP 1 @TestUserId = Id FROM dbo.Users WHERE Email LIKE '%@test.toolchess.com';

IF @TestUserId IS NOT NULL
BEGIN
    DECLARE @TestSessionId UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO dbo.GameSessions (Id, UserId, Mode, StartTime, Score, TurnCount, FinalScore)
    VALUES (@TestSessionId, @TestUserId, 'normal', GETUTCDATE(), 1000, 10, 1000);
    
    IF @@ROWCOUNT = 1
        PRINT '✓ Test game session inserted successfully';
    ELSE
        PRINT '✗ Failed to insert test game session';
    
    -- Clean up test data
    DELETE FROM dbo.GameSessions WHERE Id = @TestSessionId;
    PRINT '✓ Test data cleaned up';
END
GO

PRINT '';
GO

-- =============================================
-- 8. Check Constraints
-- =============================================
PRINT '8. Verifying check constraints...';
PRINT '';
GO

SELECT 
    t.name AS TableName,
    cc.name AS ConstraintName,
    cc.definition AS ConstraintDefinition
FROM sys.check_constraints cc
JOIN sys.tables t ON cc.parent_object_id = t.object_id
WHERE t.schema_id = SCHEMA_ID('dbo')
ORDER BY t.name, cc.name;
GO

PRINT '';
GO

-- =============================================
-- Summary
-- =============================================
PRINT '========================================';
PRINT 'Verification Summary';
PRINT '========================================';
PRINT '';
PRINT 'Database: ToolChessDB';
PRINT 'Status: Ready for use';
PRINT '';
PRINT 'Test Credentials:';
PRINT '  Regular User:';
PRINT '    Email: testuser1@test.toolchess.com';
PRINT '    Password: TestPass123!';
PRINT '';
PRINT '  Premium User:';
PRINT '    Email: premium@test.toolchess.com';
PRINT '    Password: TestPass123!';
PRINT '    (Has active Pro subscription)';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Configure backend connection string';
PRINT '2. Test backend connectivity';
PRINT '3. Begin API development';
PRINT '';
PRINT '========================================';
GO
