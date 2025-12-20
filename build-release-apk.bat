@echo off
echo ========================================
echo   Build Release APK for ToolChess
echo ========================================
echo.

cd android

echo Step 1: Cleaning previous builds...
call gradlew.bat clean
if errorlevel 1 (
    echo ERROR: Clean failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building Release APK...
echo This may take 2-5 minutes...
echo.

call gradlew.bat assembleRelease
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Location:
echo %CD%\app\build\outputs\apk\release\app-release.apk
echo.
echo Next steps:
echo 1. Copy app-release.apk to your phone
echo 2. Uninstall old version if exists
echo 3. Install the new APK
echo 4. Make sure backend server is running
echo.
echo ========================================

pause
