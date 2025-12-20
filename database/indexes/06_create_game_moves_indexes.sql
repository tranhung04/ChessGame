-- =============================================
-- Create Indexes for GameMoves Table
-- =============================================
-- Description: Performance indexes for game move queries
-- Requirements: 14.8
-- =============================================

USE ToolChessDB;
GO

-- Index on SessionId for move history
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_GameMoves_SessionId' AND object_id = OBJECT_ID('dbo.GameMoves'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_GameMoves_SessionId
    ON dbo.GameMoves(SessionId)
    INCLUDE (MoveNumber, PieceType, CapturedPiece, ScoreGained, Timestamp);
    PRINT 'Index IX_GameMoves_SessionId created';
END
ELSE
    PRINT 'Index IX_GameMoves_SessionId already exists';
GO

-- Index on MoveNumber for sequential access
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_GameMoves_MoveNumber' AND object_id = OBJECT_ID('dbo.GameMoves'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_GameMoves_MoveNumber
    ON dbo.GameMoves(SessionId, MoveNumber)
    INCLUDE (FromRow, FromCol, ToRow, ToCol, PieceType);
    PRINT 'Index IX_GameMoves_MoveNumber created';
END
ELSE
    PRINT 'Index IX_GameMoves_MoveNumber already exists';
GO

PRINT 'All GameMoves indexes created successfully';
GO
