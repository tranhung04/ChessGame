-- =============================================
-- Create Indexes for Payments Table
-- =============================================
-- Description: Performance indexes for payment queries
-- Requirements: 14.8
-- =============================================

USE ToolChessDB;
GO

-- Index on UserId for user payment history
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payments_UserId' AND object_id = OBJECT_ID('dbo.Payments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Payments_UserId
    ON dbo.Payments(UserId)
    INCLUDE (OrderId, PackageId, Amount, Status, CreatedAt);
    PRINT 'Index IX_Payments_UserId created';
END
ELSE
    PRINT 'Index IX_Payments_UserId already exists';
GO

-- Index on OrderId for payment lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payments_OrderId' AND object_id = OBJECT_ID('dbo.Payments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Payments_OrderId
    ON dbo.Payments(OrderId)
    INCLUDE (UserId, Status, Amount, CompletedAt);
    PRINT 'Index IX_Payments_OrderId created';
END
ELSE
    PRINT 'Index IX_Payments_OrderId already exists';
GO

-- Index on Status for payment monitoring
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payments_Status' AND object_id = OBJECT_ID('dbo.Payments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Payments_Status
    ON dbo.Payments(Status)
    INCLUDE (OrderId, UserId, CreatedAt);
    PRINT 'Index IX_Payments_Status created';
END
ELSE
    PRINT 'Index IX_Payments_Status already exists';
GO

-- Index on CreatedAt for payment history
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payments_CreatedAt' AND object_id = OBJECT_ID('dbo.Payments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Payments_CreatedAt
    ON dbo.Payments(CreatedAt DESC)
    INCLUDE (UserId, OrderId, Amount, Status);
    PRINT 'Index IX_Payments_CreatedAt created';
END
ELSE
    PRINT 'Index IX_Payments_CreatedAt already exists';
GO

PRINT 'All Payments indexes created successfully';
GO
