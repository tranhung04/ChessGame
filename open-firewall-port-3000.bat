@echo off
echo ========================================
echo Open Firewall Port 3000 for Backend
echo ========================================
echo.
echo This will allow other devices on WiFi to connect to your backend server.
echo.
echo NOTE: Run this as Administrator!
echo Right-click and select "Run as administrator"
echo.
pause

echo.
echo Adding firewall rule...
netsh advfirewall firewall add rule name="ToolChess Backend Port 3000" dir=in action=allow protocol=TCP localport=3000

if errorlevel 1 (
    echo.
    echo ERROR: Failed to add firewall rule!
    echo Please run this script as Administrator.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Firewall rule added successfully!
echo ========================================
echo.
echo Port 3000 is now open for incoming connections.
echo Other devices on the same WiFi can now connect to your backend.
echo.
pause
