@echo off
echo ========================================
echo   Build APK - Fix Gradle Issues
echo ========================================
echo.

cd android

echo Step 1: Clean build cache...
call gradlew clean --no-daemon

echo.
echo Step 2: Refresh dependencies...
call gradlew --refresh-dependencies

echo.
echo Step 3: Building Release APK...
echo This will take 3-5 minutes...
echo.

call gradlew assembleRelease --no-daemon --warning-mode all

if errorlevel 1 (
    echo.
    echo ========================================
    echo   BUILD FAILED!
    echo ========================================
    echo.
    echo Trying alternative method...
    echo.
    
    REM Try with stacktrace for more info
    call gradlew assembleRelease --stacktrace --no-daemon
    
    if errorlevel 1 (
        echo.
        echo Please copy the error message above and share it.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Location:
echo %CD%\app\build\outputs\apk\release\app-release.apk
echo.
echo Full Path:
echo C:\Users\tvhun\Downloads\toolchess-original\chess-mobile\android\app\build\outputs\apk\release\app-release.apk
echo.
echo File size:
dir app\build\outputs\apk\release\app-release.apk
echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo 1. Copy app-release.apk to your phone
echo 2. Uninstall old app version
echo 3. Install new APK
echo 4. Make sure backend is running (port 3000)
echo 5. Update IP in src/config/constants.js if needed
echo.

pause
