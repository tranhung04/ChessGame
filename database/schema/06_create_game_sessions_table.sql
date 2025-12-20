-- =============================================
-- Create GameSessions Table
-- =============================================
-- Description: Stores game session records
-- Requirements: 14.6
-- =============================================

USE ToolChessDB;
GO

-- Drop table if exists (for idempotency)
IF OBJECT_ID('dbo.GameSessions', 'U') IS NOT NULL
    DROP TABLE dbo.GameSessions;
GO

CREATE TABLE dbo.GameSessions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Mode NVARCHAR(20) NOT NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NULL,
    Score INT DEFAULT 0,
    TurnCount INT DEFAULT 0,
    Duration INT NULL,
    PremiumApplied BIT DEFAULT 0,
    ScoreBonus DECIMAL(3,2) DEFAULT 0,
    FinalScore INT DEFAULT 0,
    Metadata NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Constraints
    CONSTRAINT FK_GameSessions_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id),
    CONSTRAINT CK_GameSessions_Mode CHECK (Mode IN ('normal', 'premium')),
    CONSTRAINT CK_GameSessions_Score CHECK (Score >= 0),
    CONSTRAINT CK_GameSessions_TurnCount CHECK (TurnCount >= 0),
    CONSTRAINT CK_GameSessions_Duration CHECK (Duration IS NULL OR Duration >= 0),
    CONSTRAINT CK_GameSessions_ScoreBonus CHECK (ScoreBonus >= 0 AND ScoreBonus <= 1),
    CONSTRAINT CK_GameSessions_FinalScore CHECK (FinalScore >= 0)
);
GO

PRINT 'GameSessions table created successfully';
GO
