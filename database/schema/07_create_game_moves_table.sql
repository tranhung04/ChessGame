-- =============================================
-- Create GameMoves Table (Optional - Anti-Cheat)
-- =============================================
-- Description: Stores individual game moves for verification
-- Requirements: 14.7
-- =============================================

USE ToolChessDB;
GO

-- Drop table if exists (for idempotency)
IF OBJECT_ID('dbo.GameMoves', 'U') IS NOT NULL
    DROP TABLE dbo.GameMoves;
GO

CREATE TABLE dbo.GameMoves (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL,
    MoveNumber INT NOT NULL,
    FromRow INT NOT NULL,
    FromCol INT NOT NULL,
    ToRow INT NOT NULL,
    ToCol INT NOT NULL,
    PieceType NVARCHAR(20) NOT NULL,
    CapturedPiece NVARCHAR(20) NULL,
    ScoreGained INT DEFAULT 0,
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Constraints
    CONSTRAINT FK_GameMoves_GameSessions FOREIGN KEY (SessionId) 
        REFERENCES dbo.GameSessions(Id) ON DELETE CASCADE,
    CONSTRAINT CK_GameMoves_MoveNumber CHECK (MoveNumber > 0),
    CONSTRAINT CK_GameMoves_FromRow CHECK (FromRow >= 0 AND FromRow < 9),
    CONSTRAINT CK_GameMoves_FromCol CHECK (FromCol >= 0 AND FromCol < 8),
    CONSTRAINT CK_GameMoves_ToRow CHECK (ToRow >= 0 AND ToRow < 9),
    CONSTRAINT CK_GameMoves_ToCol CHECK (ToCol >= 0 AND ToCol < 8),
    CONSTRAINT CK_GameMoves_ScoreGained CHECK (ScoreGained >= 0)
);
GO

PRINT 'GameMoves table created successfully';
GO
