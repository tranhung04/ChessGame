-- =============================================
-- ToolChess Database Simple Setup Script
-- =============================================
-- Description: Complete database setup in a single file
-- Requirements: 14.1-14.9, 15.1-15.5
-- =============================================
-- This script contains all SQL commands inline for easy execution
-- Run this in SQL Server Management Studio or Azure Data Studio
-- =============================================

SET NOCOUNT ON;
GO

PRINT '========================================';
PRINT 'ToolChess Database Setup';
PRINT 'Starting at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- Step 1: Create Database
-- =============================================
PRINT 'Step 1: Creating database...';
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ToolChessDB')
BEGIN
    CREATE DATABASE ToolChessDB;
    PRINT 'Database ToolChessDB created successfully';
END
ELSE
BEGIN
    PRINT 'Database ToolChessDB already exists';
END
GO

USE ToolChessDB;
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 2: Creating tables...';
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- 2.1 Users Table
-- =============================================
PRINT '2.1 Creating Users table...';
GO

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(50) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    IsEmailVerified BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_Users_Username UNIQUE (Username),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT CK_Users_Email CHECK (Email LIKE '%@%.%'),
    CONSTRAINT CK_Users_Username CHECK (LEN(Username) >= 3 AND LEN(Username) <= 50)
);
GO

PRINT 'Users table created successfully';
PRINT '';
GO

-- =============================================
-- 2.2 RefreshTokens Table
-- =============================================
PRINT '2.2 Creating RefreshTokens table...';
GO

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
    
    CONSTRAINT UQ_RefreshTokens_Token UNIQUE (Token),
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT CK_RefreshTokens_ExpiresAt CHECK (ExpiresAt > CreatedAt)
);
GO

PRINT 'RefreshTokens table created successfully';
PRINT '';
GO

-- =============================================
-- 2.3 PremiumPackages Table
-- =============================================
PRINT '2.3 Creating PremiumPackages table...';
GO

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
    
    CONSTRAINT CK_PremiumPackages_Price CHECK (Price >= 0),
    CONSTRAINT CK_PremiumPackages_DurationDays CHECK (DurationDays > 0),
    CONSTRAINT CK_PremiumPackages_ScoreBonus CHECK (ScoreBonus >= 0 AND ScoreBonus <= 1),
    CONSTRAINT CK_PremiumPackages_ReviveCount CHECK (ReviveCount >= 0)
);
GO

PRINT 'PremiumPackages table created successfully';
PRINT '';
GO

-- =============================================
-- 2.4 UserPremiumSubscriptions Table
-- =============================================
PRINT '2.4 Creating UserPremiumSubscriptions table...';
GO

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
    
    CONSTRAINT FK_UserPremiumSubscriptions_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserPremiumSubscriptions_PremiumPackages FOREIGN KEY (PackageId) 
        REFERENCES dbo.PremiumPackages(Id),
    CONSTRAINT CK_UserPremiumSubscriptions_Dates CHECK (EndDate > StartDate),
    CONSTRAINT CK_UserPremiumSubscriptions_RevivesUsed CHECK (RevivesUsed >= 0)
);
GO

PRINT 'UserPremiumSubscriptions table created successfully';
PRINT '';
GO

-- =============================================
-- 2.5 Payments Table
-- =============================================
PRINT '2.5 Creating Payments table...';
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
    DROP TABLE dbo.Payments;
GO

CREATE TABLE dbo.Payments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    OrderId NVARCHAR(100) NOT NULL,
    PackageId NVARCHAR(50) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'VND',
    Status NVARCHAR(20) NOT NULL,
    PaymentMethod NVARCHAR(50) DEFAULT 'vnpay',
    VnpayData NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_Payments_OrderId UNIQUE (OrderId),
    CONSTRAINT FK_Payments_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id),
    CONSTRAINT FK_Payments_PremiumPackages FOREIGN KEY (PackageId) 
        REFERENCES dbo.PremiumPackages(Id),
    CONSTRAINT CK_Payments_Amount CHECK (Amount >= 0),
    CONSTRAINT CK_Payments_Status CHECK (Status IN ('pending', 'completed', 'failed', 'expired'))
);
GO

PRINT 'Payments table created successfully';
PRINT '';
GO

-- =============================================
-- 2.6 GameSessions Table
-- =============================================
PRINT '2.6 Creating GameSessions table...';
GO

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
PRINT '';
GO

-- =============================================
-- 2.7 GameMoves Table
-- =============================================
PRINT '2.7 Creating GameMoves table...';
GO

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
PRINT '';
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 3: Creating indexes...';
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- 3.1 Users Indexes
-- =============================================
PRINT '3.1 Creating Users indexes...';
GO

CREATE NONCLUSTERED INDEX IX_Users_Email
ON dbo.Users(Email)
INCLUDE (Id, Username, PasswordHash, IsEmailVerified);

CREATE NONCLUSTERED INDEX IX_Users_Username
ON dbo.Users(Username)
INCLUDE (Id, Email, CreatedAt);

CREATE NONCLUSTERED INDEX IX_Users_CreatedAt
ON dbo.Users(CreatedAt DESC);

PRINT 'Users indexes created successfully';
PRINT '';
GO

-- =============================================
-- 3.2 RefreshTokens Indexes
-- =============================================
PRINT '3.2 Creating RefreshTokens indexes...';
GO

CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserId
ON dbo.RefreshTokens(UserId)
INCLUDE (Token, ExpiresAt, RevokedAt);

CREATE NONCLUSTERED INDEX IX_RefreshTokens_Token
ON dbo.RefreshTokens(Token)
INCLUDE (UserId, ExpiresAt, RevokedAt);

CREATE NONCLUSTERED INDEX IX_RefreshTokens_ExpiresAt
ON dbo.RefreshTokens(ExpiresAt)
WHERE RevokedAt IS NULL;

PRINT 'RefreshTokens indexes created successfully';
PRINT '';
GO

-- =============================================
-- 3.3 UserPremiumSubscriptions Indexes
-- =============================================
PRINT '3.3 Creating UserPremiumSubscriptions indexes...';
GO

CREATE NONCLUSTERED INDEX IX_UserPremiumSubscriptions_UserId
ON dbo.UserPremiumSubscriptions(UserId)
INCLUDE (PackageId, StartDate, EndDate, IsActive, RevivesUsed);

CREATE NONCLUSTERED INDEX IX_UserPremiumSubscriptions_EndDate
ON dbo.UserPremiumSubscriptions(EndDate)
WHERE IsActive = 1;

CREATE NONCLUSTERED INDEX IX_UserPremiumSubscriptions_UserId_Active
ON dbo.UserPremiumSubscriptions(UserId, IsActive)
INCLUDE (PackageId, EndDate, RevivesUsed)
WHERE IsActive = 1;

PRINT 'UserPremiumSubscriptions indexes created successfully';
PRINT '';
GO

-- =============================================
-- 3.4 Payments Indexes
-- =============================================
PRINT '3.4 Creating Payments indexes...';
GO

CREATE NONCLUSTERED INDEX IX_Payments_UserId
ON dbo.Payments(UserId)
INCLUDE (OrderId, PackageId, Amount, Status, CreatedAt);

CREATE NONCLUSTERED INDEX IX_Payments_OrderId
ON dbo.Payments(OrderId)
INCLUDE (UserId, Status, Amount, CompletedAt);

CREATE NONCLUSTERED INDEX IX_Payments_Status
ON dbo.Payments(Status)
INCLUDE (OrderId, UserId, CreatedAt);

CREATE NONCLUSTERED INDEX IX_Payments_CreatedAt
ON dbo.Payments(CreatedAt DESC)
INCLUDE (UserId, OrderId, Amount, Status);

PRINT 'Payments indexes created successfully';
PRINT '';
GO

-- =============================================
-- 3.5 GameSessions Indexes
-- =============================================
PRINT '3.5 Creating GameSessions indexes...';
GO

CREATE NONCLUSTERED INDEX IX_GameSessions_UserId
ON dbo.GameSessions(UserId)
INCLUDE (Mode, Score, FinalScore, StartTime, EndTime, CreatedAt);

CREATE NONCLUSTERED INDEX IX_GameSessions_Score
ON dbo.GameSessions(FinalScore DESC)
INCLUDE (UserId, Mode, CreatedAt, PremiumApplied);

CREATE NONCLUSTERED INDEX IX_GameSessions_CreatedAt
ON dbo.GameSessions(CreatedAt DESC)
INCLUDE (UserId, Score, FinalScore, Mode);

CREATE NONCLUSTERED INDEX IX_GameSessions_UserId_Score
ON dbo.GameSessions(UserId, FinalScore DESC)
INCLUDE (Mode, CreatedAt, PremiumApplied);

PRINT 'GameSessions indexes created successfully';
PRINT '';
GO

-- =============================================
-- 3.6 GameMoves Indexes
-- =============================================
PRINT '3.6 Creating GameMoves indexes...';
GO

CREATE NONCLUSTERED INDEX IX_GameMoves_SessionId
ON dbo.GameMoves(SessionId)
INCLUDE (MoveNumber, PieceType, CapturedPiece, ScoreGained, Timestamp);

CREATE NONCLUSTERED INDEX IX_GameMoves_MoveNumber
ON dbo.GameMoves(SessionId, MoveNumber)
INCLUDE (FromRow, FromCol, ToRow, ToCol, PieceType);

PRINT 'GameMoves indexes created successfully';
PRINT '';
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 4: Seeding data...';
PRINT '========================================';
PRINT '';
GO

-- =============================================
-- 4.1 Seed Premium Packages
-- =============================================
PRINT '4.1 Seeding premium packages...';
GO

DELETE FROM dbo.PremiumPackages;
GO

INSERT INTO dbo.PremiumPackages (Id, Name, Price, Currency, DurationDays, ScoreBonus, ReviveCount, Features, IsActive)
VALUES 
(
    'basic',
    N'Cơ bản',
    29000,
    'VND',
    7,
    0.10,
    2,
    N'["+10% điểm cho mọi quân cờ","2 lượt hồi sinh miễn phí","Giao diện đặc biệt"]',
    1
),
(
    'standard',
    N'Tiêu chuẩn',
    79000,
    'VND',
    30,
    0.20,
    5,
    N'["+20% điểm cho mọi quân cờ","5 lượt hồi sinh miễn phí","Giao diện đặc biệt","Hỗ trợ ưu tiên"]',
    1
),
(
    'pro',
    'Pro',
    199000,
    'VND',
    90,
    0.30,
    10,
    N'["+30% điểm cho mọi quân cờ","10 lượt hồi sinh miễn phí","Giao diện đặc biệt","Hỗ trợ ưu tiên","Badge đặc biệt"]',
    1
),
(
    'vip',
    'VIP',
    499000,
    'VND',
    365,
    0.50,
    999999,
    N'["+50% điểm cho mọi quân cờ","Hồi sinh không giới hạn","Giao diện VIP độc quyền","Hỗ trợ ưu tiên 24/7","Badge VIP","Tên màu vàng"]',
    1
);
GO

PRINT 'Premium packages seeded successfully (4 packages)';
PRINT '';
GO

-- =============================================
-- 4.2 Seed Test Users
-- =============================================
PRINT '4.2 Seeding test users...';
PRINT 'WARNING: Test users are for development only!';
GO

DELETE FROM dbo.Users WHERE Email LIKE '%@test.toolchess.com';
GO

-- Password for all test users: "TestPass123!"
-- Hash generated with bcrypt rounds=12
DECLARE @TestPasswordHash NVARCHAR(255) = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Zu3u8m';

INSERT INTO dbo.Users (Id, Username, Email, PasswordHash, IsEmailVerified, CreatedAt, UpdatedAt)
VALUES 
(
    NEWID(),
    'testuser1',
    'testuser1@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
),
(
    NEWID(),
    'testuser2',
    'testuser2@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
),
(
    NEWID(),
    'premiumuser',
    'premium@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
),
(
    NEWID(),
    'adminuser',
    'admin@test.toolchess.com',
    @TestPasswordHash,
    1,
    GETUTCDATE(),
    GETUTCDATE()
);
GO

-- Create premium subscription for premiumuser
DECLARE @PremiumUserId UNIQUEIDENTIFIER;
SELECT @PremiumUserId = Id FROM dbo.Users WHERE Email = 'premium@test.toolchess.com';

IF @PremiumUserId IS NOT NULL
BEGIN
    INSERT INTO dbo.UserPremiumSubscriptions (UserId, PackageId, StartDate, EndDate, IsActive, RevivesUsed)
    VALUES (
        @PremiumUserId,
        'pro',
        GETUTCDATE(),
        DATEADD(DAY, 90, GETUTCDATE()),
        1,
        0
    );
END
GO

PRINT 'Test users seeded successfully (4 users)';
PRINT '';
GO

-- =============================================
-- Step 5: Verification
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Step 5: Verification';
PRINT '========================================';
PRINT '';
GO

PRINT 'Tables created:';
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

PRINT '';
PRINT 'Total indexes:';
SELECT COUNT(*) AS IndexCount
FROM sys.indexes
WHERE object_id IN (
    SELECT object_id 
    FROM sys.tables 
    WHERE schema_id = SCHEMA_ID('dbo')
)
AND index_id > 0;
GO

PRINT '';
PRINT 'Premium packages:';
SELECT Id, Name, Price, DurationDays, ScoreBonus, ReviveCount
FROM dbo.PremiumPackages
ORDER BY Price;
GO

PRINT '';
PRINT 'Test users:';
SELECT Username, Email, IsEmailVerified
FROM dbo.Users
WHERE Email LIKE '%@test.toolchess.com'
ORDER BY Username;
GO

-- =============================================
-- Completion
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Database setup completed successfully!';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';
PRINT 'Summary:';
PRINT '- 7 tables created';
PRINT '- 20+ indexes created for performance';
PRINT '- 4 premium packages seeded';
PRINT '- 4 test users created';
PRINT '';
PRINT 'Test credentials:';
PRINT '  Email: testuser1@test.toolchess.com';
PRINT '  Password: TestPass123!';
PRINT '';
PRINT 'Premium test user:';
PRINT '  Email: premium@test.toolchess.com';
PRINT '  Password: TestPass123!';
PRINT '  (Has active Pro subscription)';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Update backend .env with connection string';
PRINT '2. Test database connectivity';
PRINT '3. Start backend development';
PRINT '';
GO
