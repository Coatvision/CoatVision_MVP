# CoatVision Dashboard Setup Script (PowerShell)
# This script sets up the dashboard/frontend development environment

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "install", "verify", "start", "build", "preview", "lint", "help")]
    [string]$Command = "setup"
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$FrontendDir = Join-Path $ProjectRoot "frontend"

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

# Check frontend directory exists
function Test-FrontendDirectory {
    Write-Info "Checking frontend directory..."
    
    if (-not (Test-Path $FrontendDir)) {
        Write-ErrorMessage "Frontend directory not found at: $FrontendDir"
        return $false
    }
    
    Write-Success "Frontend directory found"
    return $true
}

# Install dependencies
function Install-Dependencies {
    Write-Info "Installing dashboard dependencies..."
    
    Set-Location $FrontendDir
    
    # Check if package.json exists
    $packageJson = Join-Path $FrontendDir "package.json"
    if (-not (Test-Path $packageJson)) {
        Write-Warning "No package.json found. Creating a basic one..."
        
        $packageContent = @'
{
  "name": "coatvision-dashboard",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
'@
        Set-Content -Path $packageJson -Value $packageContent
        Write-Success "Created package.json"
    }
    
    # Remove node_modules if exists for clean install
    $nodeModules = Join-Path $FrontendDir "node_modules"
    if (Test-Path $nodeModules) {
        Write-Info "Removing existing node_modules..."
        Remove-Item -Recurse -Force $nodeModules
    }
    
    # Remove package-lock.json for clean install
    $packageLock = Join-Path $FrontendDir "package-lock.json"
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
    Write-Info "Verifying dashboard configuration..."
    
    Set-Location $FrontendDir
    
    # Check for required files
    $requiredFiles = @(
        "package.json",
        "src\App.jsx",
        "src\main.jsx"
    )
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $FrontendDir $file
        if (Test-Path $filePath) {
            Write-Success "Found: $file"
        } else {
            Write-Warning "Missing: $file"
        }
    }
    
    # Check for vite config
    $viteConfigJs = Join-Path $FrontendDir "vite.config.js"
    $viteConfigTs = Join-Path $FrontendDir "vite.config.ts"
    if ((Test-Path $viteConfigJs) -or (Test-Path $viteConfigTs)) {
        Write-Success "Found Vite configuration"
    } else {
        Write-Warning "Missing Vite configuration. Creating default..."
        New-ViteConfig
    }
    
    # Check for index.html
    $indexHtml = Join-Path $FrontendDir "index.html"
    if (Test-Path $indexHtml) {
        Write-Success "Found: index.html"
    } else {
        Write-Warning "Missing: index.html. Creating default..."
        New-IndexHtml
    }
}

# Create Vite configuration
function New-ViteConfig {
    $viteConfig = @'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
'@
    $viteConfigPath = Join-Path $FrontendDir "vite.config.js"
    Set-Content -Path $viteConfigPath -Value $viteConfig
    Write-Success "Created vite.config.js"
}

# Create index.html
function New-IndexHtml {
    $indexHtml = @'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CoatVision Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'@
    $indexHtmlPath = Join-Path $FrontendDir "index.html"
    Set-Content -Path $indexHtmlPath -Value $indexHtml
    Write-Success "Created index.html"
}

# Start the dashboard in development mode
function Start-Dashboard {
    Write-Info "Starting dashboard in development mode..."
    
    Set-Location $FrontendDir
    
    Write-Info "Dashboard starting on http://localhost:3000"
    Write-Info "Press Ctrl+C to stop"
    
    & npm run dev
}

# Build for production
function Build-Production {
    Write-Info "Building dashboard for production..."
    
    Set-Location $FrontendDir
    
    & npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Production build complete"
        Write-Info "Build output is in: $FrontendDir\dist"
    } else {
        Write-ErrorMessage "Production build failed"
        exit 1
    }
}

# Preview production build
function Start-Preview {
    Write-Info "Previewing production build..."
    
    Set-Location $FrontendDir
    
    $distDir = Join-Path $FrontendDir "dist"
    if (-not (Test-Path $distDir)) {
        Write-ErrorMessage "No production build found. Run 'build' first."
        exit 1
    }
    
    & npm run preview
}

# Run linting
function Invoke-Lint {
    Write-Info "Running linter..."
    
    Set-Location $FrontendDir
    
    $packageJson = Join-Path $FrontendDir "package.json"
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
    Write-Host "CoatVision Dashboard Setup Script"
    Write-Host ""
    Write-Host "Usage: .\setup-dashboard.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  setup       Full setup: check dependencies, install packages"
    Write-Host "  install     Install/update dependencies only"
    Write-Host "  verify      Verify configuration and dependencies"
    Write-Host "  start       Start the dashboard (development mode)"
    Write-Host "  build       Build for production"
    Write-Host "  preview     Preview production build"
    Write-Host "  lint        Run linter"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "If no command is provided, 'setup' will be executed."
}

# Main function
function Main {
    Write-Host "=========================================="
    Write-Host "CoatVision Dashboard Setup Script"
    Write-Host "=========================================="
    Write-Host ""
    
    switch ($Command) {
        "setup" {
            if (-not (Test-Node)) { exit 1 }
            if (-not (Test-Npm)) { exit 1 }
            if (-not (Test-FrontendDirectory)) { exit 1 }
            Install-Dependencies
            Test-Configuration
            Write-Success "Dashboard setup complete!"
            Write-Host ""
            Write-Info "To start the dashboard, run: .\setup-dashboard.ps1 start"
            Write-Info "To build for production, run: .\setup-dashboard.ps1 build"
        }
        "install" {
            if (-not (Test-Node)) { exit 1 }
            if (-not (Test-Npm)) { exit 1 }
            if (-not (Test-FrontendDirectory)) { exit 1 }
            Install-Dependencies
        }
        "verify" {
            if (-not (Test-Node)) { exit 1 }
            if (-not (Test-Npm)) { exit 1 }
            if (-not (Test-FrontendDirectory)) { exit 1 }
            Test-Configuration
        }
        "start" {
            Start-Dashboard
        }
        "build" {
            Build-Production
        }
        "preview" {
            Start-Preview
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
