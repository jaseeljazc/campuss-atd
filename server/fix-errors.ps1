# PowerShell script to fix common errors
Write-Host "=== Class Companion Backend - Error Fixer ===" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($CommandName)
    $null = Get-Command $CommandName -ErrorAction SilentlyContinue
    return $?
}

# 1. Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "  OK: Node.js installed: $nodeVersion" -ForegroundColor Green
    
    # Check version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "  WARNING: Node.js version should be >= 18.0.0" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERROR: Node.js not found. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}

# 2. Check npm
Write-Host "[2/6] Checking npm..." -ForegroundColor Yellow
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "  OK: npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ERROR: npm not found" -ForegroundColor Red
    exit 1
}

# 3. Check .env file
Write-Host "[3/6] Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "  OK: .env file exists" -ForegroundColor Green
    
    # Check if required variables are set
    $envContent = Get-Content .env -Raw
    $requiredVars = @("MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        $pattern = "$var\s*="
        if ($envContent -notmatch $pattern) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "  WARNING: Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Yellow
        Write-Host "  Please update .env file with required variables" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERROR: .env file not found" -ForegroundColor Red
    if (Test-Path .env.example) {
        Write-Host "  Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        Write-Host "  OK: Created .env file. Please update it with your configuration." -ForegroundColor Green
    } else {
        Write-Host "  ERROR: .env.example not found. Please create .env manually." -ForegroundColor Red
    }
}

# 4. Check node_modules
Write-Host "[4/6] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "  OK: node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  ERROR: node_modules not found" -ForegroundColor Red
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# 5. Check MongoDB connection (if MONGO_URI is set)
Write-Host "[5/6] Checking MongoDB configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    if ($envContent -match "MONGO_URI\s*=\s*(.+)") {
        $mongoUri = $matches[1].Trim()
        Write-Host "  OK: MONGO_URI is set" -ForegroundColor Green
        if ($mongoUri -eq "" -or $mongoUri -match "your-|localhost") {
            Write-Host "  WARNING: Please update MONGO_URI with your actual MongoDB connection string" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  WARNING: MONGO_URI not found in .env" -ForegroundColor Yellow
    }
}

# 6. Test module loading
Write-Host "[6/6] Testing module loading..." -ForegroundColor Yellow
try {
    $nodeCommand = "try { require('./app.js'); console.log('OK'); } catch(e) { console.error('ERROR:', e.message); process.exit(1); }"
    $testResult = node -e $nodeCommand 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: All modules load successfully" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Module loading failed" -ForegroundColor Red
        Write-Host "  $testResult" -ForegroundColor Red
    }
} catch {
    Write-Host "  ERROR: Error testing modules: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "If all checks passed, you can start the server with:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use the PowerShell script:" -ForegroundColor Green
Write-Host "  .\start.ps1" -ForegroundColor White
Write-Host ""
