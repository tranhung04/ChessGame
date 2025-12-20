-- =============================================
-- Create Indexes for GameSessions Table
-- =============================================
-- Description: Performance indexes for game session queries
-- Requirements: 14.8
-- =============================================

USE ToolChessDB;
GO

-- Index on UserId for user game history
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_GameSessions_UserId' AND object_id = OBJECT_ID('dbo.GameSessions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_GameSessions_UserId
    ON dbo.GameSessions(UserId)
    INCLUDE (Mode, Score, FinalScore, StartTime, EndTime, CreatedAt);
    PRINT 'Index IX_GameSessions_UserId created';
END
ELSE
    PRINT 'Index IX_GameSessions_UserId already exists';
GO

-- Index on Score for leaderboard queries (DESC for top scores)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_GameSessions_Score' AND object_id = OBJECT_ID('dbo.GameSessions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_GameSessions_Score
    ON dbo.GameSessions(FinalScore DESC)
    INCLUDE (UserId, Mode, CreatedAt, PremiumApplied);
    PRINT 'Index IX_GameSessions_Score created';
END
ELSE
    PRINT 'Index IX_GameSessions_Score already exists';
GO

-- Index on CreatedAt for recent games
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_GameSessions_CreatedAt' AND object_id = OBJECT_ID('dbo.GameSessions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_GameSessions_CreatedAt
    ON dbo.GameSessions(CreatedAt DESC)
    INCLUDE (UserId, Score, FinalScore, Mode);
    PRINT 'Index IX_GameSessions_CreatedAt created';
END
ELSE
    PRINT 'Index IX_GameSessions_CreatedAt already exists';
GO

-- Composite index for user's best scores
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_GameSessions_UserId_Score' AND object_id = OBJECT_ID('dbo.GameSessions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_GameSessions_UserId_Score
    ON dbo.GameSessions(UserId, FinalScore DESC)
    INCLUDE (Mode, CreatedAt, PremiumApplied);
    PRINT 'Index IX_GameSessions_UserId_Score created';
END
ELSE
    PRINT 'Index IX_GameSessions_UserId_Score already exists';
GO

PRINT 'All GameSessions indexes created successfully';
GO
