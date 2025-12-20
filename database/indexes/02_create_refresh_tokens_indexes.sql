-- =============================================
-- Create Indexes for RefreshTokens Table
-- =============================================
-- Description: Performance indexes for token queries
-- Requirements: 14.8
-- =============================================

USE ToolChessDB;
GO

-- Index on UserId for user token queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RefreshTokens_UserId' AND object_id = OBJECT_ID('dbo.RefreshTokens'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserId
    ON dbo.RefreshTokens(UserId)
    INCLUDE (Token, ExpiresAt, RevokedAt);
    PRINT 'Index IX_RefreshTokens_UserId created';
END
ELSE
    PRINT 'Index IX_RefreshTokens_UserId already exists';
GO

-- Index on Token for token lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RefreshTokens_Token' AND object_id = OBJECT_ID('dbo.RefreshTokens'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_Token
    ON dbo.RefreshTokens(Token)
    INCLUDE (UserId, ExpiresAt, RevokedAt);
    PRINT 'Index IX_RefreshTokens_Token created';
END
ELSE
    PRINT 'Index IX_RefreshTokens_Token already exists';
GO

-- Index on ExpiresAt for cleanup queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RefreshTokens_ExpiresAt' AND object_id = OBJECT_ID('dbo.RefreshTokens'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_ExpiresAt
    ON dbo.RefreshTokens(ExpiresAt)
    WHERE RevokedAt IS NULL;
    PRINT 'Index IX_RefreshTokens_ExpiresAt created';
END
ELSE
    PRINT 'Index IX_RefreshTokens_ExpiresAt already exists';
GO

PRINT 'All RefreshTokens indexes created successfully';
GO
