-- =============================================
-- Create UserPremiumSubscriptions Table
-- =============================================
-- Description: Stores user premium subscription records
-- Requirements: 14.4
-- =============================================

USE ToolChessDB;
GO

-- Drop table if exists (for idempotency)
IF OBJECT_ID('dbo.UserPremiumSubscriptions', 'U') IS NOT NULL
    DROP TABLE dbo.UserPremiumSubscriptions;
GO

CREATE TABLE dbo.UserPremiumSubscriptions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PackageId NVARCHAR(50) NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    IsActive BIT DEFAULT 1,
    RevivesUsed INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Constraints
    CONSTRAINT FK_UserPremiumSubscriptions_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserPremiumSubscriptions_PremiumPackages FOREIGN KEY (PackageId) 
        REFERENCES dbo.PremiumPackages(Id),
    CONSTRAINT CK_UserPremiumSubscriptions_Dates CHECK (EndDate > StartDate),
    CONSTRAINT CK_UserPremiumSubscriptions_RevivesUsed CHECK (RevivesUsed >= 0)
);
GO

PRINT 'UserPremiumSubscriptions table created successfully';
GO
