-- =============================================
-- Create RefreshTokens Table
-- =============================================
-- Description: Stores refresh tokens for JWT authentication
-- Requirements: 14.2
-- =============================================

USE ToolChessDB;
GO

-- Drop table if exists (for idempotency)
IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NOT NULL
    DROP TABLE dbo.RefreshTokens;
GO

CREATE TABLE dbo.RefreshTokens (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Token NVARCHAR(500) NOT NULL,
    DeviceInfo NVARCHAR(500),
    IpAddress NVARCHAR(50),
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    RevokedAt DATETIME2 NULL,
    
    -- Constraints
    CONSTRAINT UQ_RefreshTokens_Token UNIQUE (Token),
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT CK_RefreshTokens_ExpiresAt CHECK (ExpiresAt > CreatedAt)
);
GO

PRINT 'RefreshTokens table created successfully';
GO
