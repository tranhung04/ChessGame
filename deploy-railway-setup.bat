@echo off
echo ========================================
echo   Setup for Railway Deployment
echo ========================================
echo.

echo Creating necessary files for Railway...
echo.

echo [1/2] Checking if Git is initialized...
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo Done!
) else (
    echo Git already initialized.
)
echo.

echo [2/2] Creating .gitignore if not exists...
if not exist ".gitignore" (
    echo Creating .gitignore...
    (
        echo node_modules/
        echo .env
        echo .expo/
        echo android/build/
        echo android/app/build/
        echo ios/build/
        echo *.log
        echo .DS_Store
    ) > .gitignore
    echo Done!
) else (
    echo .gitignore already exists.
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Create GitHub repository at: https://github.com/new
echo.
echo 2. Run these commands:
echo    git add .
echo    git commit -m "Initial commit"
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git push -u origin main
echo.
echo 3. Go to Railway: https://railway.app
echo    - Login with GitHub
echo    - Deploy from GitHub repo
echo    - Select your repository
echo.
echo 4. Add database (if needed):
echo    - Click "New" ^> "Database" ^> "Add MySQL"
echo    - Copy connection details to Environment Variables
echo.
echo 5. Generate domain:
echo    - Settings ^> Generate Domain
echo    - Copy URL for your APK
echo.
echo See DEPLOY_TO_RAILWAY.md for detailed instructions.
echo.
pause
