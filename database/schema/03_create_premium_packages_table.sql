-- =============================================
-- Create PremiumPackages Table
-- =============================================
-- Description: Stores premium package definitions
-- Requirements: 14.3
-- =============================================

USE ToolChessDB;
GO

-- Drop table if exists (for idempotency)
IF OBJECT_ID('dbo.PremiumPackages', 'U') IS NOT NULL
    DROP TABLE dbo.PremiumPackages;
GO

CREATE TABLE dbo.PremiumPackages (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'VND',
    DurationDays INT NOT NULL,
    ScoreBonus DECIMAL(3,2) NOT NULL,
    ReviveCount INT NOT NULL,
    Features NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Constraints
    CONSTRAINT CK_PremiumPackages_Price CHECK (Price >= 0),
    CONSTRAINT CK_PremiumPackages_DurationDays CHECK (DurationDays > 0),
    CONSTRAINT CK_PremiumPackages_ScoreBonus CHECK (ScoreBonus >= 0 AND ScoreBonus <= 1),
    CONSTRAINT CK_PremiumPackages_ReviveCount CHECK (ReviveCount >= 0)
);
GO

PRINT 'PremiumPackages table created successfully';
GO
