# PowerShell script to seed users (students and teachers)
Write-Host "Seeding users (students and teachers)..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Error: .env file not found. Please create it first." -ForegroundColor Red
    exit 1
}

# Run the seed script
Write-Host "Running seed script..." -ForegroundColor Yellow
npm run seed:users

if ($LASTEXITCODE -eq 0) {
    Write-Host "Users seeded successfully!" -ForegroundColor Green
    Write-Host "Default password for all users: 123456" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check scripts/README.md for list of all users" -ForegroundColor Yellow
} else {
    Write-Host "Error: Failed to seed users" -ForegroundColor Red
    exit 1
}
