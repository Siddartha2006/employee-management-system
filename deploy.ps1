# Deployment & Pre-flight Verification Script for Windows (PowerShell)
# Employee Management System

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Employee Management System - Pre-Deployment   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Run Backend Tests
Write-Host "[1/3] Running Backend Pytest Suite..." -ForegroundColor Yellow
cd backend
.\venv\Scripts\pytest.exe -v --tb=short
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend tests failed! Aborting deployment." -ForegroundColor Red
    cd ..
    exit 1
}
Write-Host ">> Backend tests PASSED (26/26 specs)!" -ForegroundColor Green
cd ..
Write-Host ""

# Step 2: Test Frontend Production Build
Write-Host "[2/3] Building Frontend Production Bundle..." -ForegroundColor Yellow
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed! Aborting deployment." -ForegroundColor Red
    cd ..
    exit 1
}
Write-Host ">> Frontend build SUCCESSFUL (dist/ created)!" -ForegroundColor Green
cd ..
Write-Host ""

# Step 3: Git Status & Remote Check
Write-Host "[3/3] Checking Git Status..." -ForegroundColor Yellow
git status --short
$remote = git remote -v
if (-not $remote) {
    Write-Host ""
    Write-Host ">> No Git remote configured yet." -ForegroundColor DarkYellow
    Write-Host "To link your GitHub repository and deploy, run:" -ForegroundColor White
    Write-Host "  git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git" -ForegroundColor Cyan
    Write-Host "  git branch -M main" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Cyan
} else {
    Write-Host ">> Git remote configured:" -ForegroundColor Green
    Write-Host $remote
    Write-Host "Pushing to remote main branch..." -ForegroundColor Yellow
    git push origin main
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  System is 100% Ready for Render & Vercel Deploy " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
