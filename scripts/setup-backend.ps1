# CoatVision Backend Setup Script (PowerShell)
# This script sets up the backend development environment

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "install", "verify", "test", "start", "help")]
    [string]$Command = "setup"
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $ProjectRoot "backend"

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

# Check if Python is installed
function Test-Python {
    Write-Info "Checking Python installation..."
    
    $pythonCmd = $null
    $pythonVersion = $null
    
    # Try python3 first
    try {
        $pythonVersion = & python3 --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $script:PythonCmd = "python3"
            Write-Success "Python found: $pythonVersion"
            return $true
        }
    } catch { }
    
    # Try python
    try {
        $pythonVersion = & python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $script:PythonCmd = "python"
            Write-Success "Python found: $pythonVersion"
            return $true
        }
    } catch { }
    
    Write-ErrorMessage "Python is not installed. Please install Python 3.9 or higher."
    return $false
}

# Check if pip is installed
function Test-Pip {
    Write-Info "Checking pip installation..."
    
    try {
        $pipVersion = & pip --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $script:PipCmd = "pip"
            Write-Success "pip found"
            return $true
        }
    } catch { }
    
    try {
        $pipVersion = & pip3 --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $script:PipCmd = "pip3"
            Write-Success "pip3 found"
            return $true
        }
    } catch { }
    
    Write-ErrorMessage "pip is not installed. Please install pip."
    return $false
}

# Create virtual environment
function New-VirtualEnvironment {
    Write-Info "Creating virtual environment..."
    
    $venvDir = Join-Path $BackendDir ".venv"
    
    if (Test-Path $venvDir) {
        Write-Warning "Virtual environment already exists. Removing..."
        Remove-Item -Recurse -Force $venvDir
    }
    
    & $script:PythonCmd -m venv $venvDir
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMessage "Failed to create virtual environment"
        exit 1
    }
    
    Write-Success "Virtual environment created at $venvDir"
}

# Install dependencies
function Install-Dependencies {
    Write-Info "Installing dependencies..."
    
    $venvDir = Join-Path $BackendDir ".venv"
    $activateScript = Join-Path $venvDir "Scripts\Activate.ps1"
    
    if (-not (Test-Path $activateScript)) {
        Write-ErrorMessage "Could not find virtual environment activation script"
        exit 1
    }
    
    # Activate virtual environment
    & $activateScript
    
    # Upgrade pip
    & pip install --upgrade pip
    
    # Install dependencies from backend requirements
    $backendReqs = Join-Path $BackendDir "requirements.txt"
    $projectReqs = Join-Path $ProjectRoot "requirements.txt"
    
    if (Test-Path $backendReqs) {
        Write-Info "Installing dependencies from backend/requirements.txt..."
        & pip install -r $backendReqs
    } elseif (Test-Path $projectReqs) {
        Write-Info "Installing dependencies from requirements.txt..."
        & pip install -r $projectReqs
    } else {
        Write-Warning "No requirements.txt found. Skipping dependency installation."
    }
    
    # Install development dependencies
    Write-Info "Installing development dependencies..."
    & pip install pytest pytest-cov flake8 black
    
    Write-Success "Dependencies installed successfully"
}

# Verify configuration
function Test-Configuration {
    Write-Info "Verifying configuration..."
    
    # Check for required files
    $requiredFiles = @(
        (Join-Path $BackendDir "main.py"),
        (Join-Path $BackendDir "requirements.txt")
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "Found: $file"
        } else {
            Write-Warning "Missing: $file"
        }
    }
    
    # Check for required directories
    $requiredDirs = @(
        (Join-Path $BackendDir "routers"),
        (Join-Path $BackendDir "api")
    )
    
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Success "Found directory: $dir"
        } else {
            Write-Warning "Missing directory: $dir"
        }
    }
}

# Run backend tests
function Invoke-Tests {
    Write-Info "Running backend tests..."
    
    $venvDir = Join-Path $BackendDir ".venv"
    $activateScript = Join-Path $venvDir "Scripts\Activate.ps1"
    
    if (Test-Path $activateScript) {
        & $activateScript
    }
    
    Set-Location $ProjectRoot
    
    $testsDir = Join-Path $ProjectRoot "tests"
    if (Test-Path $testsDir) {
        & pytest tests/ -v --tb=short
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Some tests failed. Check the output above."
            return $false
        }
        Write-Success "All tests passed"
    } else {
        Write-Warning "No tests directory found. Skipping tests."
    }
    
    return $true
}

# Start the backend server
function Start-BackendServer {
    Write-Info "Starting the backend server..."
    
    $venvDir = Join-Path $BackendDir ".venv"
    $activateScript = Join-Path $venvDir "Scripts\Activate.ps1"
    
    if (Test-Path $activateScript) {
        & $activateScript
    }
    
    Set-Location $BackendDir
    
    Write-Info "Backend server starting on http://localhost:8000"
    Write-Info "Press Ctrl+C to stop the server"
    
    & uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

# Show usage information
function Show-Usage {
    Write-Host "CoatVision Backend Setup Script"
    Write-Host ""
    Write-Host "Usage: .\setup-backend.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  setup       Full setup: check dependencies, create venv, install packages"
    Write-Host "  install     Install/update dependencies only"
    Write-Host "  verify      Verify configuration and dependencies"
    Write-Host "  test        Run backend tests"
    Write-Host "  start       Start the backend server"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "If no command is provided, 'setup' will be executed."
}

# Main function
function Main {
    Write-Host "=========================================="
    Write-Host "CoatVision Backend Setup Script"
    Write-Host "=========================================="
    Write-Host ""
    
    switch ($Command) {
        "setup" {
            if (-not (Test-Python)) { exit 1 }
            if (-not (Test-Pip)) { exit 1 }
            New-VirtualEnvironment
            Install-Dependencies
            Test-Configuration
            Write-Success "Backend setup complete!"
            Write-Host ""
            Write-Info "To start the server, run: .\setup-backend.ps1 start"
            Write-Info "To run tests, run: .\setup-backend.ps1 test"
        }
        "install" {
            if (-not (Test-Python)) { exit 1 }
            if (-not (Test-Pip)) { exit 1 }
            Install-Dependencies
        }
        "verify" {
            if (-not (Test-Python)) { exit 1 }
            if (-not (Test-Pip)) { exit 1 }
            Test-Configuration
        }
        "test" {
            Invoke-Tests
        }
        "start" {
            Start-BackendServer
        }
        "help" {
            Show-Usage
        }
    }
}

Main
