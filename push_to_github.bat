@echo off
REM ==========================================
REM Pench Rakshak - GitHub Push Helper Script
REM ==========================================

echo [1/5] Initializing Git repository...
git init -b main

echo.
echo [2/5] Staging project files...
git add .

echo.
echo [3/5] Creating initial commit...
git commit -m "Initial commit: Pench Rakshak project"

echo.
echo ==========================================
SET /P REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/pench-rakshak.git): "

if "%REPO_URL%"=="" (
    echo Error: No repository URL provided.
    pause
    exit /b 1
)

echo.
echo [4/5] Adding remote origin...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo.
echo [5/5] Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ==========================================
echo Project successfully pushed to GitHub!
echo ==========================================
pause
