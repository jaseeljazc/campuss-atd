# PowerShell script to setup .env file with secure random secrets
Write-Host "Setting up .env file with secure secrets..." -ForegroundColor Green

# Function to generate random string
function Get-RandomString {
    param([int]$Length = 32)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $random = 1..$Length | ForEach-Object { Get-Random -Maximum $chars.length }
    return -join ($random | ForEach-Object { $chars[$_] })
}

# Check if .env exists
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
    } else {
        Write-Host "ERROR: .env.example not found" -ForegroundColor Red
        exit 1
    }
}

# Read .env content
$envContent = Get-Content .env -Raw

# Generate secrets if missing
$accessSecret = Get-RandomString -Length 64
$refreshSecret = Get-RandomString -Length 64

# Update JWT secrets
if ($envContent -notmatch "JWT_ACCESS_SECRET\s*=") {
    $envContent += "`nJWT_ACCESS_SECRET=$accessSecret"
    Write-Host "Added JWT_ACCESS_SECRET" -ForegroundColor Green
} else {
    Write-Host "JWT_ACCESS_SECRET already exists" -ForegroundColor Cyan
}

if ($envContent -notmatch "JWT_REFRESH_SECRET\s*=") {
    $envContent += "`nJWT_REFRESH_SECRET=$refreshSecret"
    Write-Host "Added JWT_REFRESH_SECRET" -ForegroundColor Green
} else {
    Write-Host "JWT_REFRESH_SECRET already exists" -ForegroundColor Cyan
}

# Write back to .env
$envContent | Set-Content .env -NoNewline

Write-Host ""
Write-Host "Done! Your .env file is now configured." -ForegroundColor Green
Write-Host "Please verify MONGO_URI is set correctly." -ForegroundColor Yellow
