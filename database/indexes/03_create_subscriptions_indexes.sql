-- =============================================
-- Create Indexes for UserPremiumSubscriptions Table
-- =============================================
-- Description: Performance indexes for subscription queries
-- Requirements: 14.8
-- =============================================

USE ToolChessDB;
GO

-- Index on UserId for user subscription queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserPremiumSubscriptions_UserId' AND object_id = OBJECT_ID('dbo.UserPremiumSubscriptions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserPremiumSubscriptions_UserId
    ON dbo.UserPremiumSubscriptions(UserId)
    INCLUDE (PackageId, StartDate, EndDate, IsActive, RevivesUsed);
    PRINT 'Index IX_UserPremiumSubscriptions_UserId created';
END
ELSE
    PRINT 'Index IX_UserPremiumSubscriptions_UserId already exists';
GO

-- Index on EndDate for expiration checks
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserPremiumSubscriptions_EndDate' AND object_id = OBJECT_ID('dbo.UserPremiumSubscriptions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserPremiumSubscriptions_EndDate
    ON dbo.UserPremiumSubscriptions(EndDate)
    WHERE IsActive = 1;
    PRINT 'Index IX_UserPremiumSubscriptions_EndDate created';
END
ELSE
    PRINT 'Index IX_UserPremiumSubscriptions_EndDate already exists';
GO

-- Composite index for active subscription lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserPremiumSubscriptions_UserId_Active' AND object_id = OBJECT_ID('dbo.UserPremiumSubscriptions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserPremiumSubscriptions_UserId_Active
    ON dbo.UserPremiumSubscriptions(UserId, IsActive)
    INCLUDE (PackageId, EndDate, RevivesUsed)
    WHERE IsActive = 1;
    PRINT 'Index IX_UserPremiumSubscriptions_UserId_Active created';
END
ELSE
    PRINT 'Index IX_UserPremiumSubscriptions_UserId_Active already exists';
GO

PRINT 'All UserPremiumSubscriptions indexes created successfully';
GO
