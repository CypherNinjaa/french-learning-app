# Apply the lesson unlocking fix script
Write-Host "Running lesson unlocking fix script..." -ForegroundColor Green

# Check if Node.js is installed
try {
    node --version | Out-Null
}
catch {
    Write-Host "Node.js is not installed. Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Install required packages if not already installed
if (-not (Test-Path -Path "node_modules/dotenv")) {
    Write-Host "Installing required packages..." -ForegroundColor Yellow
    npm install dotenv
}

# Execute the script
Write-Host "Applying database fixes..." -ForegroundColor Yellow
try {
    node ./scripts/apply-lesson-unlocking-fix.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Lesson unlocking fix completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Lesson unlocking fix failed with exit code $LASTEXITCODE" -ForegroundColor Red
    }
}
catch {
    Write-Host "Error applying lesson unlocking fix: $_" -ForegroundColor Red
    exit 1
}
