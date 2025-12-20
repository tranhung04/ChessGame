-- =============================================
-- Create Payments Table
-- =============================================
-- Description: Stores payment transaction records
-- Requirements: 14.5
-- =============================================

USE ToolChessDB;
GO

-- Drop table if exists (for idempotency)
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
    
    -- Constraints
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
GO
