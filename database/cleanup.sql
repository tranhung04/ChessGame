-- =============================================
-- ToolChess Database Cleanup Script
-- =============================================
-- WARNING: This script will DELETE the entire database!
-- Use only in development environment
-- DO NOT RUN IN PRODUCTION
-- =============================================

USE master;
GO

PRINT '========================================';
PRINT 'WARNING: Database Cleanup';
PRINT '========================================';
PRINT '';
PRINT 'This will DELETE the ToolChessDB database!';
PRINT 'Press Ctrl+C to cancel within 5 seconds...';
PRINT '';
GO

-- Wait 5 seconds
WAITFOR DELAY '00:00:05';
GO

PRINT 'Proceeding with cleanup...';
PRINT '';
GO

-- Close all connections to the database
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'ToolChessDB')
BEGIN
    PRINT 'Closing all connections to ToolChessDB...';
    
    ALTER DATABASE ToolChessDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    
    PRINT 'Dropping database ToolChessDB...';
    DROP DATABASE ToolChessDB;
    
    PRINT 'Database ToolChessDB dropped successfully';
END
ELSE
BEGIN
    PRINT 'Database ToolChessDB does not exist';
END
GO

PRINT '';
PRINT 'Cleanup completed';
PRINT '';
GO
