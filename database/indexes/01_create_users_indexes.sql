-- =============================================
-- Create Indexes for Users Table
-- =============================================
-- Description: Performance indexes for user queries
-- Requirements: 14.8
-- =============================================

USE ToolChessDB;
GO

-- Index on Email for login queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('dbo.Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Email
    ON dbo.Users(Email)
    INCLUDE (Id, Username, PasswordHash, IsEmailVerified);
    PRINT 'Index IX_Users_Email created';
END
ELSE
    PRINT 'Index IX_Users_Email already exists';
GO

-- Index on Username for profile queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Username' AND object_id = OBJECT_ID('dbo.Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Username
    ON dbo.Users(Username)
    INCLUDE (Id, Email, CreatedAt);
    PRINT 'Index IX_Users_Username created';
END
ELSE
    PRINT 'Index IX_Users_Username already exists';
GO

-- Index on CreatedAt for analytics
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_CreatedAt' AND object_id = OBJECT_ID('dbo.Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_CreatedAt
    ON dbo.Users(CreatedAt DESC);
    PRINT 'Index IX_Users_CreatedAt created';
END
ELSE
    PRINT 'Index IX_Users_CreatedAt already exists';
GO

PRINT 'All Users indexes created successfully';
GO
