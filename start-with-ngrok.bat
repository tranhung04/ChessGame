@echo off
echo ========================================
echo   Start Backend with Ngrok
echo ========================================
echo.

echo Step 1: Starting backend server...
start "ToolChess Backend" cmd /k "cd backend && node src/server.js"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 2: Starting Ngrok tunnel...
echo.
echo NOTE: You need to install Ngrok first!
echo Download from: https://ngrok.com/download
echo.
echo After Ngrok starts, copy the HTTPS URL (e.g., https://abc123.ngrok.io)
echo Use that URL in your APK configuration.
echo.
pause

ngrok http 3000

pause
