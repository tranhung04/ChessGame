@echo off
echo ========================================
echo Clean Android Build Cache - FORCE MODE
echo ========================================
echo.
echo IMPORTANT: Close Android Studio before running!
echo Press Ctrl+C to cancel, or
pause
echo.

echo [1/6] Killing Java/Gradle processes...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM studio64.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done!
echo.

echo [2/6] Removing CMake cache (.cxx folders)...
if exist "android\.cxx" (
    rd /s /q "android\.cxx" 2>nul
    echo Removed android\.cxx
)
if exist "android\app\.cxx" (
    rd /s /q "android\app\.cxx" 2>nul
    echo Removed android\app\.cxx
)
echo.

echo [3/6] Removing ALL native module build folders...
for /d %%i in (node_modules\*) do (
    if exist "%%i\android\.cxx" (
        rd /s /q "%%i\android\.cxx" 2>nul
        echo Removed %%i\android\.cxx
    )
    if exist "%%i\android\build" (
        rd /s /q "%%i\android\build" 2>nul
        echo Removed %%i\android\build
    )
)
echo.

echo [4/6] Removing autolinking generated files...
if exist "android\app\build\generated\autolinking" (
    rd /s /q "android\app\build\generated\autolinking" 2>nul
    echo Removed autolinking cache
)
echo.

echo [5/6] Removing android build folder...
if exist "android\build" (
    rd /s /q "android\build" 2>nul
    echo Removed android\build
)
if exist "android\app\build" (
    rd /s /q "android\app\build" 2>nul
    echo Removed android\app\build
)
echo.

echo [6/6] Cleaning Gradle cache...
cd android
call gradlew clean --no-daemon
cd ..
echo Done!
echo.

echo ========================================
echo Clean completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Open Android Studio
echo 2. File ^> Invalidate Caches ^> Invalidate and Restart
echo 3. After restart: Build ^> Rebuild Project
echo 4. Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo.
pause
