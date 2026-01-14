# PowerShell Setup Guide

## Quick Start

### 1. Set Execution Policy (if needed)

If you get an execution policy error, run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Start the Server

```powershell
.\start.ps1
```

Or manually:
```powershell
npm run dev
```

### 3. Seed HOD User

```powershell
.\seed-hod.ps1
```

Or manually:
```powershell
npm run seed:hod
```

## Common PowerShell Issues

### Issue: "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "npm is not recognized"

**Solution:**
- Make sure Node.js is installed
- Restart PowerShell after installing Node.js
- Check PATH: `$env:PATH`

### Issue: "MONGO_URI is not set"

**Solution:**
1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Edit `.env` and set your MongoDB connection string

### Issue: Port Already in Use

**Solution:**
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

## Manual Commands

### Install Dependencies
```powershell
npm install
```

### Start Development Server
```powershell
npm run dev
```

### Start Production Server
```powershell
npm start
```

### Seed HOD User
```powershell
npm run seed:hod
```

## Environment Variables

Create a `.env` file in the `server` directory with:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance-management
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
CLIENT_ORIGIN=http://localhost:8080
```

## Troubleshooting

### Check Node.js Version
```powershell
node --version
```
Should be >= 18.0.0

### Check npm Version
```powershell
npm --version
```

### Check MongoDB Connection
Make sure MongoDB is running:
```powershell
# If using local MongoDB
mongod --version

# Or check if MongoDB service is running
Get-Service | Where-Object {$_.Name -like "*mongo*"}
```

### View Logs
Server logs are displayed in the console. For more detailed logs, check the log level in `.env`:
```
LOG_LEVEL=debug
```
