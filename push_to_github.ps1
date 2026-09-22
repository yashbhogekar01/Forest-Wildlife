# ==========================================
# Pench Rakshak - GitHub Push Helper Script (PowerShell)
# ==========================================

Write-Host "[1/5] Initializing Git repository..." -ForegroundColor Cyan
git init -b main

Write-Host "`n[2/5] Staging project files..." -ForegroundColor Cyan
git add .

Write-Host "`n[3/5] Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Pench Rakshak project"

Write-Host "`n==========================================" -ForegroundColor Yellow
$repoUrl = Read-Host "Enter your GitHub Repository URL (e.g., https://github.com/username/pench-rakshak.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "Error: No repository URL provided." -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/5] Setting remote origin..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $repoUrl

Write-Host "`n[5/5] Pushing to GitHub..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "Project successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
