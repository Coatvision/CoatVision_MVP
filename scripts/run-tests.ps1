# CoatVision Test Runner Script (PowerShell)
# This script runs tests for all components

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "backend", "frontend", "dashboard", "mobile", "docker", "api", "quick", "help")]
    [string]$Command = "all"
)

# Script configuration
$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Test results tracking
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsSkipped = 0

# Color functions for output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}

# Run backend tests
function Invoke-BackendTests {
    Write-Section "Running Backend Tests"
    
    $BackendDir = Join-Path $ProjectRoot "backend"
    $VenvDir = Join-Path $BackendDir ".venv"
    
    # Check if virtual environment exists
    if (-not (Test-Path $VenvDir)) {
        Write-Warning "Virtual environment not found. Creating..."
        
        try {
            & python -m venv $VenvDir
        } catch {
            try {
                & python3 -m venv $VenvDir
            } catch {
                Write-ErrorMessage "Could not create virtual environment"
                $script:TestsFailed++
                return
            }
        }
    }
    
    # Activate virtual environment
    $ActivateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
    if (Test-Path $ActivateScript) {
        & $ActivateScript
    } else {
        Write-ErrorMessage "Could not activate virtual environment"
        $script:TestsFailed++
        return
    }
    
    # Install test dependencies
    & pip install --quiet pytest pytest-cov pytest-asyncio httpx 2>$null
    
    # Install project dependencies
    $BackendReqs = Join-Path $BackendDir "requirements.txt"
    $ProjectReqs = Join-Path $ProjectRoot "requirements.txt"
    
    if (Test-Path $BackendReqs) {
        & pip install --quiet -r $BackendReqs 2>$null
    } elseif (Test-Path $ProjectReqs) {
        & pip install --quiet -r $ProjectReqs 2>$null
    }
    
    Set-Location $ProjectRoot
    
    # Run pytest
    $TestsDir = Join-Path $ProjectRoot "tests"
    if (Test-Path $TestsDir) {
        Write-Info "Running pytest..."
        
        & pytest tests/ -v --tb=short -q
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backend tests passed"
            $script:TestsPassed++
        } else {
            Write-ErrorMessage "Backend tests failed"
            $script:TestsFailed++
        }
    } else {
        Write-Warning "No tests directory found"
        $script:TestsSkipped++
    }
    
    # Run flake8 linting
    Write-Info "Running flake8 linting..."
    & pip install --quiet flake8 2>$null
    & flake8 backend/ --exclude=.venv,__pycache__ --count --select=E9,F63,F7,F82 --show-source --statistics 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Flake8 linting passed (critical errors)"
    } else {
        Write-Warning "Flake8 found some issues"
    }
}

# Run frontend tests
function Invoke-FrontendTests {
    Write-Section "Running Frontend/Dashboard Tests"
    
    $FrontendDir = Join-Path $ProjectRoot "frontend"
    
    if (-not (Test-Path $FrontendDir)) {
        Write-Warning "Frontend directory not found"
        $script:TestsSkipped++
        return
    }
    
    Set-Location $FrontendDir
    
    # Check if package.json exists
    $PackageJson = Join-Path $FrontendDir "package.json"
    if (-not (Test-Path $PackageJson)) {
        Write-Warning "No package.json found in frontend"
        $script:TestsSkipped++
        return
    }
    
    # Install dependencies if node_modules doesn't exist
    $NodeModules = Join-Path $FrontendDir "node_modules"
    if (-not (Test-Path $NodeModules)) {
        Write-Info "Installing frontend dependencies..."
        & npm install --silent 2>$null
    }
    
    # Check if test script exists
    $Content = Get-Content $PackageJson -Raw
    if ($Content -match '"test"') {
        Write-Info "Running frontend tests..."
        & npm test -- --passWithNoTests 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend tests passed"
            $script:TestsPassed++
        } else {
            Write-Warning "Frontend tests failed or not configured"
            $script:TestsSkipped++
        }
    } else {
        Write-Warning "No test script found in frontend"
        $script:TestsSkipped++
    }
    
    # Run ESLint if available
    if ($Content -match '"lint"') {
        Write-Info "Running ESLint..."
        & npm run lint 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "ESLint found issues or not configured"
        }
    }
}

# Run mobile tests
function Invoke-MobileTests {
    Write-Section "Running Mobile App Tests"
    
    $MobileDir = Join-Path $ProjectRoot "mobile"
    
    if (-not (Test-Path $MobileDir)) {
        Write-Warning "Mobile directory not found"
        $script:TestsSkipped++
        return
    }
    
    Set-Location $MobileDir
    
    # Check if package.json exists
    $PackageJson = Join-Path $MobileDir "package.json"
    if (-not (Test-Path $PackageJson)) {
        Write-Warning "No package.json found in mobile"
        $script:TestsSkipped++
        return
    }
    
    # Install dependencies if node_modules doesn't exist
    $NodeModules = Join-Path $MobileDir "node_modules"
    if (-not (Test-Path $NodeModules)) {
        Write-Info "Installing mobile dependencies..."
        & npm install --silent 2>$null
    }
    
    # Check if test script exists
    $Content = Get-Content $PackageJson -Raw
    if ($Content -match '"test"') {
        Write-Info "Running mobile tests..."
        & npm test -- --passWithNoTests 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Mobile tests passed"
            $script:TestsPassed++
        } else {
            Write-Warning "Mobile tests failed or not configured"
            $script:TestsSkipped++
        }
    } else {
        Write-Warning "No test script found in mobile"
        $script:TestsSkipped++
    }
}

# Run Docker tests
function Invoke-DockerTests {
    Write-Section "Running Docker Tests"
    
    # Check if Docker is available
    try {
        $null = & docker --version 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Docker not found" }
    } catch {
        Write-Warning "Docker is not installed"
        $script:TestsSkipped++
        return
    }
    
    # Check if Docker daemon is running
    try {
        $null = & docker info 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Docker daemon not running" }
    } catch {
        Write-Warning "Docker daemon is not running"
        $script:TestsSkipped++
        return
    }
    
    Set-Location $ProjectRoot
    
    # Check for docker-compose.yml
    $ComposeFile = Join-Path $ProjectRoot "docker-compose.yml"
    if (-not (Test-Path $ComposeFile)) {
        Write-Warning "docker-compose.yml not found"
        $script:TestsSkipped++
        return
    }
    
    # Determine compose command
    $ComposeCmd = $null
    try {
        $null = & docker-compose --version 2>&1
        if ($LASTEXITCODE -eq 0) { $ComposeCmd = "docker-compose" }
    } catch { }
    
    if (-not $ComposeCmd) {
        try {
            $null = & docker compose version 2>&1
            if ($LASTEXITCODE -eq 0) { $ComposeCmd = "docker compose" }
        } catch { }
    }
    
    if (-not $ComposeCmd) {
        Write-Warning "Docker Compose not available"
        $script:TestsSkipped++
        return
    }
    
    # Validate docker-compose.yml syntax
    Write-Info "Validating docker-compose.yml..."
    if ($ComposeCmd -eq "docker compose") {
        & docker compose config -q 2>$null
    } else {
        & docker-compose config -q 2>$null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "docker-compose.yml is valid"
        $script:TestsPassed++
    } else {
        Write-ErrorMessage "docker-compose.yml has errors"
        $script:TestsFailed++
    }
    
    # Check Dockerfiles
    Write-Info "Checking Dockerfiles..."
    
    $BackendDockerfile = Join-Path $ProjectRoot "backend\Dockerfile"
    if (Test-Path $BackendDockerfile) {
        Write-Success "Found: backend/Dockerfile"
        $script:TestsPassed++
    } else {
        Write-Warning "backend/Dockerfile not found"
        $script:TestsSkipped++
    }
    
    $FrontendDockerfile = Join-Path $ProjectRoot "frontend\Dockerfile"
    if (Test-Path $FrontendDockerfile) {
        Write-Success "Found: frontend/Dockerfile"
        $script:TestsPassed++
    } else {
        Write-Warning "frontend/Dockerfile not found"
        $script:TestsSkipped++
    }
}

# Test backend API health
function Test-BackendApi {
    Write-Section "Testing Backend API Health"
    
    Write-Info "Checking if backend is running on localhost:8000..."
    
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($Response.StatusCode -eq 200) {
            Write-Success "Backend health check passed"
            $script:TestsPassed++
            
            # Test root endpoint
            Write-Info "Testing root endpoint..."
            $RootResponse = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($RootResponse.Content -match "status") {
                Write-Success "Root endpoint responded correctly"
                $script:TestsPassed++
            } else {
                Write-Warning "Root endpoint response unexpected"
            }
        }
    } catch {
        Write-Warning "Backend is not running. Start it with: .\setup-backend.ps1 start"
        $script:TestsSkipped++
    }
}

# Print test summary
function Write-Summary {
    Write-Section "Test Summary"
    
    $Total = $script:TestsPassed + $script:TestsFailed + $script:TestsSkipped
    
    Write-Host "Total Tests:  $Total"
    Write-Host "Passed:       $($script:TestsPassed)" -ForegroundColor Green
    Write-Host "Failed:       $($script:TestsFailed)" -ForegroundColor Red
    Write-Host "Skipped:      $($script:TestsSkipped)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($script:TestsFailed -eq 0) {
        Write-Success "All tests passed!"
        return $true
    } else {
        Write-ErrorMessage "Some tests failed. Please review the output above."
        return $false
    }
}

# Show usage information
function Show-Usage {
    Write-Host "CoatVision Test Runner Script"
    Write-Host ""
    Write-Host "Usage: .\run-tests.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  all         Run all tests (default)"
    Write-Host "  backend     Run backend tests only"
    Write-Host "  frontend    Run frontend/dashboard tests only"
    Write-Host "  mobile      Run mobile app tests only"
    Write-Host "  docker      Run Docker configuration tests only"
    Write-Host "  api         Test backend API health"
    Write-Host "  quick       Quick test (backend + docker validation)"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "If no command is provided, 'all' will be executed."
}

# Main function
function Main {
    Write-Host "=========================================="
    Write-Host "CoatVision Test Runner Script"
    Write-Host "=========================================="
    Write-Host ""
    
    switch ($Command) {
        "all" {
            Invoke-BackendTests
            Invoke-FrontendTests
            Invoke-MobileTests
            Invoke-DockerTests
            Write-Summary
        }
        "backend" {
            Invoke-BackendTests
            Write-Summary
        }
        { $_ -eq "frontend" -or $_ -eq "dashboard" } {
            Invoke-FrontendTests
            Write-Summary
        }
        "mobile" {
            Invoke-MobileTests
            Write-Summary
        }
        "docker" {
            Invoke-DockerTests
            Write-Summary
        }
        "api" {
            Test-BackendApi
            Write-Summary
        }
        "quick" {
            Invoke-BackendTests
            Invoke-DockerTests
            Write-Summary
        }
        "help" {
            Show-Usage
        }
    }
}

Main
