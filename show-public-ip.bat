@echo off
echo ========================================
echo   Check Public IP Address
echo ========================================
echo.
echo Checking your public IP address...
echo.

powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content"

echo.
echo ========================================
echo This is your PUBLIC IP address
echo ========================================
echo.
echo Use this IP for port forwarding setup.
echo After port forwarding, users can access:
echo http://[YOUR_PUBLIC_IP]:3000
echo.
echo See SETUP_PUBLIC_SERVER.md for full instructions.
echo.
pause
