-- =============================================
-- Seed Premium Packages Data
-- =============================================
-- Description: Insert premium package definitions
-- Requirements: 15.3
-- =============================================

USE ToolChessDB;
GO

-- Delete existing packages (for idempotency)
DELETE FROM dbo.PremiumPackages;
GO

-- Insert premium packages
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

-- Verify insertion
SELECT 
    Id,
    Name,
    Price,
    Currency,
    DurationDays,
    ScoreBonus,
    ReviveCount,
    IsActive
FROM dbo.PremiumPackages
ORDER BY Price;
GO

PRINT 'Premium packages seeded successfully';
PRINT '4 packages inserted: basic, standard, pro, vip';
GO
