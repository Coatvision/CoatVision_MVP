# CoatVision Mobile App Setup Script (PowerShell)
# This script sets up the mobile development environment (React Native/Expo)

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "install", "verify", "start", "android", "ios", "web", "lint", "help")]
    [string]$Command = "setup"
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$MobileDir = Join-Path $ProjectRoot "mobile"

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

# Check if Node.js is installed
function Test-Node {
    Write-Info "Checking Node.js installation..."
    
    try {
        $nodeVersion = & node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Node.js found: $nodeVersion"
            
            # Check if version is at least 18
            $major = [int]($nodeVersion -replace 'v' -split '\.')[0]
            if ($major -lt 18) {
                Write-Warning "Node.js 18 or higher is recommended. Found: $nodeVersion"
            }
            return $true
        }
    } catch { }
    
    Write-ErrorMessage "Node.js is not installed. Please install Node.js 18 or higher."
    Write-Info "Download from: https://nodejs.org/"
    return $false
}

# Check if npm is installed
function Test-Npm {
    Write-Info "Checking npm installation..."
    
    try {
        $npmVersion = & npm --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "npm found: $npmVersion"
            return $true
        }
    } catch { }
    
    Write-ErrorMessage "npm is not installed. Please install npm."
    return $false
}

# Check if Expo CLI is installed
function Test-Expo {
    Write-Info "Checking Expo CLI..."
    
    try {
        $expoVersion = & expo --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Expo CLI found: $expoVersion"
            return $true
        }
    } catch { }
    
    Write-Warning "Expo CLI not found globally. Installing..."
    & npm install -g expo-cli
    Write-Success "Expo CLI installed"
    return $true
}

# Check mobile directory exists
function Test-MobileDirectory {
    Write-Info "Checking mobile directory..."
    
    if (-not (Test-Path $MobileDir)) {
        Write-ErrorMessage "Mobile directory not found at: $MobileDir"
        return $false
    }
    
    Write-Success "Mobile directory found"
    return $true
}

# Install dependencies
function Install-Dependencies {
    Write-Info "Installing mobile app dependencies..."
    
    Set-Location $MobileDir
    
    # Remove node_modules if exists for clean install
    $nodeModules = Join-Path $MobileDir "node_modules"
    if (Test-Path $nodeModules) {
        Write-Info "Removing existing node_modules..."
        Remove-Item -Recurse -Force $nodeModules
    }
    
    # Remove package-lock.json for clean install
    $packageLock = Join-Path $MobileDir "package-lock.json"
    if (Test-Path $packageLock) {
        Write-Info "Removing existing package-lock.json..."
        Remove-Item -Force $packageLock
    }
    
    # Install dependencies
    & npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed successfully"
    } else {
        Write-ErrorMessage "Failed to install dependencies"
        exit 1
    }
}

# Verify configuration
function Test-Configuration {
    Write-Info "Verifying mobile app configuration..."
    
    Set-Location $MobileDir
    
    # Check for required files
    $requiredFiles = @(
        "package.json",
        "src\App.jsx"
    )
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $MobileDir $file
        if (Test-Path $filePath) {
            Write-Success "Found: $file"
        } else {
            # Try alternative paths
            $altFile = $file -replace '\.jsx$', '.js'
            $altPath = Join-Path $MobileDir $altFile
            if (Test-Path $altPath) {
                Write-Success "Found: $altFile"
            } else {
                Write-Warning "Missing: $file"
            }
        }
    }
    
    # Check for app.json (Expo config)
    $appJson = Join-Path $MobileDir "app.json"
    if (Test-Path $appJson) {
        Write-Success "Found: app.json (Expo configuration)"
    } else {
        Write-Warning "Missing: app.json (Expo configuration)"
    }
    
    # Verify package.json has required scripts
    $packageJson = Join-Path $MobileDir "package.json"
    if (Test-Path $packageJson) {
        $content = Get-Content $packageJson -Raw
        if ($content -match '"start"') {
            Write-Success "Start script found in package.json"
        } else {
            Write-Warning "Start script not found in package.json"
        }
    }
}

# Check for required platform tools
function Test-PlatformTools {
    Write-Info "Checking platform development tools..."
    
    # Check for Android SDK
    if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
        Write-Success "Android SDK found at: $env:ANDROID_HOME"
    } elseif ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
        Write-Success "Android SDK found at: $env:ANDROID_SDK_ROOT"
    } else {
        Write-Warning "Android SDK not found. Android development may not work."
        Write-Info "Set ANDROID_HOME or ANDROID_SDK_ROOT environment variable."
    }
    
    # Check for Java
    try {
        $javaVersion = & java -version 2>&1
        Write-Success "Java found"
    } catch {
        Write-Warning "Java not found. Android development may not work."
    }
}

# Start the mobile app in development mode
function Start-MobileApp {
    Write-Info "Starting mobile app in development mode..."
    
    Set-Location $MobileDir
    
    Write-Info "Mobile app starting..."
    Write-Info "Press 'a' for Android, 'i' for iOS, or 'w' for web"
    Write-Info "Press Ctrl+C to stop"
    
    & npm start
}

# Start with specific platform
function Start-Android {
    Write-Info "Starting mobile app for Android..."
    
    Set-Location $MobileDir
    
    & npm run android
}

function Start-iOS {
    Write-Info "Starting mobile app for iOS..."
    
    Write-ErrorMessage "iOS development is only available on macOS"
    exit 1
}

function Start-Web {
    Write-Info "Starting mobile app for Web..."
    
    Set-Location $MobileDir
    
    & npm run web
}

# Run linting
function Invoke-Lint {
    Write-Info "Running linter..."
    
    Set-Location $MobileDir
    
    $packageJson = Join-Path $MobileDir "package.json"
    $content = Get-Content $packageJson -Raw
    
    if ($content -match '"lint"') {
        & npm run lint
    } else {
        Write-Warning "No lint script found. Running eslint directly..."
        & npx eslint src/ --ext .js,.jsx,.ts,.tsx
    }
}

# Show usage information
function Show-Usage {
    Write-Host "CoatVision Mobile App Setup Script"
    Write-Host ""
    Write-Host "Usage: .\setup-mobile.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  setup       Full setup: check dependencies, install packages"
    Write-Host "  install     Install/update dependencies only"
    Write-Host "  verify      Verify configuration and dependencies"
    Write-Host "  start       Start the mobile app (development mode)"
    Write-Host "  android     Start for Android"
    Write-Host "  ios         Start for iOS (not available on Windows)"
    Write-Host "  web         Start for Web"
    Write-Host "  lint        Run linter"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "If no command is provided, 'setup' will be executed."
}

# Main function
function Main {
    Write-Host "=========================================="
    Write-Host "CoatVision Mobile App Setup Script"
    Write-Host "=========================================="
    Write-Host ""
    
    switch ($Command) {
        "setup" {
            if (-not (Test-Node)) { exit 1 }
            if (-not (Test-Npm)) { exit 1 }
            if (-not (Test-MobileDirectory)) { exit 1 }
            Test-Expo
            Install-Dependencies
            Test-Configuration
            Test-PlatformTools
            Write-Success "Mobile app setup complete!"
            Write-Host ""
            Write-Info "To start the app, run: .\setup-mobile.ps1 start"
            Write-Info "For Android: .\setup-mobile.ps1 android"
            Write-Info "For Web: .\setup-mobile.ps1 web"
        }
        "install" {
            if (-not (Test-Node)) { exit 1 }
            if (-not (Test-Npm)) { exit 1 }
            if (-not (Test-MobileDirectory)) { exit 1 }
            Install-Dependencies
        }
        "verify" {
            if (-not (Test-Node)) { exit 1 }
            if (-not (Test-Npm)) { exit 1 }
            if (-not (Test-MobileDirectory)) { exit 1 }
            Test-Configuration
            Test-PlatformTools
        }
        "start" {
            Start-MobileApp
        }
        "android" {
            Start-Android
        }
        "ios" {
            Start-iOS
        }
        "web" {
            Start-Web
        }
        "lint" {
            Invoke-Lint
        }
        "help" {
            Show-Usage
        }
    }
}

Main
