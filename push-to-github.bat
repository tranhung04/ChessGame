@echo off
echo ========================================
echo   Push Code to GitHub
echo ========================================
echo.

echo Initializing Git repository...
git init
echo.

echo Adding all files...
git add .
echo.

echo Committing changes...
git commit -m "Initial commit - ToolChess Backend"
echo.

echo Adding remote repository...
git remote add origin https://github.com/hungprovip123/ChessGame.git
echo.

echo Checking if main branch exists...
git branch -M main
echo.

echo Pushing to GitHub...
git push -u origin main
echo.

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Push failed!
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. You need to login to GitHub first
    echo 2. Repository already has content
    echo.
    echo Try this:
    echo git push -u origin main --force
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Success! Code pushed to GitHub
echo ========================================
echo.
echo Repository: https://github.com/hungprovip123/ChessGame
echo.
echo Next steps:
echo 1. Go to: https://railway.app
echo 2. Login with GitHub
echo 3. Click "Deploy from GitHub repo"
echo 4. Select: hungprovip123/ChessGame
echo 5. Wait for deployment to complete
echo 6. Generate domain in Settings
echo.
pause
