# PowerShell script to start the server
Write-Host "Starting Class Companion Backend Server..." -ForegroundColor Green

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
    Write-Host "Warning: .env file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "Created .env file. Please update it with your configuration." -ForegroundColor Yellow
    } else {
        Write-Host "Error: .env.example not found. Please create .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
npm run dev
