@echo off
echo ========================================
echo   Enable Windows Long Path Support
echo ========================================
echo.
echo This will enable support for file paths longer than 260 characters.
echo You need to run this as Administrator!
echo.
pause

echo Enabling long path support in Windows...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

if errorlevel 1 (
    echo.
    echo ERROR: Failed to enable long paths!
    echo Please run this script as Administrator:
    echo 1. Right-click on this file
    echo 2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Long path support has been enabled.
echo.
echo IMPORTANT: You need to RESTART your computer for this to take effect!
echo.
echo After restart, run the build again:
echo   cd android
echo   gradlew assembleRelease
echo.
pause
