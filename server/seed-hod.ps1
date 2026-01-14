# PowerShell script to seed HOD user
Write-Host "Seeding HOD user..." -ForegroundColor Green

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
npm run seed:hod

if ($LASTEXITCODE -eq 0) {
    Write-Host "HOD user seeded successfully!" -ForegroundColor Green
    Write-Host "Email: hod@gmail.com" -ForegroundColor Cyan
    Write-Host "Password: 123456" -ForegroundColor Cyan
} else {
    Write-Host "Error: Failed to seed HOD user" -ForegroundColor Red
    exit 1
}
