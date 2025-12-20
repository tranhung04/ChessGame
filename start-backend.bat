@echo off
echo ========================================
echo   ToolChess Backend Server
echo ========================================
echo.

cd backend

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)

echo.
echo Starting backend server on port 3000...
echo.
echo Keep this window open while using the app!
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

node src/server.js

pause
