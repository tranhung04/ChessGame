@echo off
echo ========================================
echo   Di Chuyen Du An Den Duong Dan Ngan
echo   Move Project to Shorter Path
echo ========================================
echo.
echo Duong dan hien tai / Current path:
echo %CD%
echo.
echo Duong dan moi / New path:
echo C:\chess
echo.
echo Thao tac nay se:
echo 1. Tao thu muc C:\chess
echo 2. Copy toan bo du an sang thu muc moi
echo 3. Giu nguyen du an cu (khong xoa)
echo.
echo This will:
echo 1. Create C:\chess folder
echo 2. Copy entire project to new location
echo 3. Keep original project (not delete)
echo.
pause

echo.
echo Dang tao thu muc moi...
echo Creating new folder...
if not exist "C:\chess" mkdir "C:\chess"

echo.
echo Dang copy du an... (Co the mat vai phut)
echo Copying project... (May take a few minutes)
xcopy "%CD%" "C:\chess" /E /I /H /Y

if errorlevel 1 (
    echo.
    echo LOI: Khong the copy du an!
    echo ERROR: Failed to copy project!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   THANH CONG! / SUCCESS!
echo ========================================
echo.
echo Du an da duoc copy den: C:\chess
echo Project has been copied to: C:\chess
echo.
echo Cac buoc tiep theo / Next steps:
echo.
echo 1. Mo Command Prompt moi / Open new Command Prompt
echo 2. cd C:\chess
echo 3. npm install
echo 4. cd android
echo 5. gradlew assembleRelease
echo.
echo Ban co the xoa du an cu sau khi test thanh cong!
echo You can delete old project after successful testing!
echo.
pause
