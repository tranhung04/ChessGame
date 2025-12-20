@echo off
echo ========================================
echo   ToolChess Server Information
echo ========================================
echo.

echo Finding your IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo Your laptop IP: !IP!
    echo.
    echo ========================================
    echo Backend Server URL:
    echo http://!IP!:3000
    echo ========================================
    echo.
    echo Share this URL with users to configure their app.
    echo.
    echo Instructions for users:
    echo 1. Connect to the same WiFi as this laptop
    echo 2. Install the APK on their phone
    echo 3. Configure app to use: http://!IP!:3000
    echo 4. Make sure backend is running ^(start-backend.bat^)
    echo.
    goto :found
)

:found
pause
