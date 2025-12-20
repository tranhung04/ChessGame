@echo off
echo ========================================
echo   Find Your Computer's IP Address
echo ========================================
echo.
echo Looking for WiFi IP address...
echo.

ipconfig | findstr /i "IPv4 Wireless"

echo.
echo ========================================
echo.
echo Copy the IP address (e.g., 192.168.1.100)
echo Update it in: src/config/constants.js
echo.
echo Current API URL in constants.js:
echo http://10.66.214.152:3000/api
echo.
echo Change to:
echo http://YOUR_IP:3000/api
echo.
echo ========================================
pause
