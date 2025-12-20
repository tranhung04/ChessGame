-- =============================================
-- Seed Test Users (Development Only)
-- =============================================
-- Description: Create test users for development
-- Requirements: 15.4
-- WARNING: DO NOT RUN IN PRODUCTION
-- =============================================

USE ToolChessDB;
GO

-- Delete existing test users (for idempotency)
DELETE FROM dbo.Users WHERE Email LIKE '%@test.toolchess.com';
GO

-- Insert test users
-- Password for all test users: "TestPass123!"
-- Hash generated with bcrypt rounds=12
DECLARE @TestPasswordHash NVARCHAR(255) = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Zu3u8m';

INSERT INTO dbo.Users (Id, Username, Email, PasswordHash, IsEmailVerified, CreatedAt, UpdatedAt)
VALUES 
(
    NEWID(),
    'testuser1',
    'testuser1@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
),
(
    NEWID(),
    'testuser2',
    'testuser2@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
),
(
    NEWID(),
    'premiumuser',
    'premium@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
),
(
    NEWID(),
    'adminuser',
    'admin@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
);
GO

-- Create a premium subscription for premiumuser
DECLARE @PremiumUserId UNIQUEIDENTIFIER;
SELECT @PremiumUserId = Id FROM dbo.Users WHERE Email = 'premium@test.toolchess.com';

IF @PremiumUserId IS NOT NULL
BEGIN
    INSERT INTO dbo.UserPremiumSubscriptions (UserId, PackageId, StartDate, EndDate, IsActive, RevivesUsed)
    VALUES (
        @PremiumUserId,
        'pro',
        GETUTCDATE(),
        DATEADD(DAY, 90, GETUTCDATE()),
        1,
        0
    );
    PRINT 'Premium subscription created for premiumuser';
END
GO

-- Verify insertion
SELECT 
    Id,
    Username,
    Email,
    IsEmailVerified,
    CreatedAt
FROM dbo.Users
WHERE Email LIKE '%@test.toolchess.com'
ORDER BY Username;
GO

PRINT 'Test users seeded successfully';
PRINT '4 test users created with password: TestPass123!';
PRINT 'Users: testuser1, testuser2, premiumuser (with Pro subscription), adminuser';
PRINT '';
PRINT 'WARNING: These are test accounts for development only!';
PRINT 'DO NOT use these accounts in production!';
GO
