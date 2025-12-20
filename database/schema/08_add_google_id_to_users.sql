-- Add GoogleId and Avatar columns to Users table for Google OAuth support

USE ToolChessDB;
GO

-- Check if GoogleId column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'GoogleId'
)
BEGIN
    ALTER TABLE Users
    ADD GoogleId NVARCHAR(255) NULL;
    
    PRINT 'GoogleId column added to Users table';
END
ELSE
BEGIN
    PRINT 'GoogleId column already exists in Users table';
END
GO

-- Check if Avatar column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'Avatar'
)
BEGIN
    ALTER TABLE Users
    ADD Avatar NVARCHAR(500) NULL;
    
    PRINT 'Avatar column added to Users table';
END
ELSE
BEGIN
    PRINT 'Avatar column already exists in Users table';
END
GO

-- Create index on GoogleId for faster lookups
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_Users_GoogleId' 
    AND object_id = OBJECT_ID('Users')
)
BEGIN
    CREATE INDEX IX_Users_GoogleId ON Users(GoogleId);
    PRINT 'Index IX_Users_GoogleId created';
END
ELSE
BEGIN
    PRINT 'Index IX_Users_GoogleId already exists';
END
GO

-- Make PasswordHash nullable for Google users
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'PasswordHash'
    AND is_nullable = 0
)
BEGIN
    ALTER TABLE Users
    ALTER COLUMN PasswordHash NVARCHAR(255) NULL;
    
    PRINT 'PasswordHash column is now nullable';
END
ELSE
BEGIN
    PRINT 'PasswordHash column is already nullable';
END
GO

PRINT 'Google OAuth schema updates completed successfully!';
GO
