@echo off
echo ========================================
echo   Build Release APK - Simple Method
echo ========================================
echo.

cd android

echo Cleaning previous builds...
call gradlew clean

echo.
echo Building Release APK...
echo This may take 3-5 minutes...
echo.

call gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo ========================================
    echo   BUILD FAILED!
    echo ========================================
    echo.
    echo If you see Gradle version error:
    echo 1. Open Android Studio
    echo 2. Click "Upgrade Gradle" when prompted
    echo 3. Wait for sync to complete
    echo 4. Run this script again
    echo.
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
echo Full path:
echo C:\Users\tvhun\Downloads\toolchess-original\chess-mobile\android\app\build\outputs\apk\release\app-release.apk
echo.
echo Next steps:
echo 1. Copy app-release.apk to your phone
echo 2. Uninstall old version if exists
echo 3. Install the new APK
echo 4. Make sure backend server is running
echo.
echo ========================================

pause
