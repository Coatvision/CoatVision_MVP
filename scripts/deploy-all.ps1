# CoatVision Integrated System Deployment Script for Windows
# This script deploys all subsystems (Backend, Dashboard) using Docker Compose.
# Compatible with Windows PowerShell and PowerShell Core

param(
    [ValidateSet("start", "stop", "restart", "status", "logs", "build", "clean")]
    [string]$Command = "start",
    [switch]$Detach = $false,
    [switch]$Help = $false
)

# Stop on errors
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Print-Banner {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host "   CoatVision Integrated Deployment" -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
}

function Print-Usage {
    Write-Host "CoatVision Deployment Script"
    Write-Host ""
    Write-Host "Usage: .\deploy-all.ps1 [-Command <command>] [-Detach] [-Help]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start       Start all services (default)"
    Write-Host "  stop        Stop all services"
    Write-Host "  restart     Restart all services"
    Write-Host "  status      Show status of all services"
    Write-Host "  logs        Show logs from all services"
    Write-Host "  build       Build all Docker images"
    Write-Host "  clean       Stop and remove all containers, volumes, and images"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Detach     Run in detached mode"
    Write-Host "  -Help       Show this help message"
    Write-Host ""
}

if ($Help) {
    Print-Usage
    exit 0
}

Print-Banner

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Set-Location $ProjectRoot
Write-Info "Working directory: $ProjectRoot"

# Check Docker installation
Write-Info "Checking Docker installation..."
try {
    & docker --version 2>&1 | Out-Null
    Write-Success "Docker is installed"
} catch {
    Write-Error "Docker is not installed. Please install Docker."
    Write-Info "Download from: https://www.docker.com/get-started"
    exit 1
}

# Check Docker Compose
$dockerComposeCmd = $null
try {
    & docker compose version 2>&1 | Out-Null
    $dockerComposeCmd = "docker compose"
    Write-Success "Using: docker compose"
} catch {
    try {
        & docker-compose --version 2>&1 | Out-Null
        $dockerComposeCmd = "docker-compose"
        Write-Success "Using: docker-compose"
    } catch {
        Write-Error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    }
}

# Check for docker-compose.yml
$composeFile = Join-Path $ProjectRoot "docker-compose.yml"
if (-not (Test-Path $composeFile)) {
    Write-Error "docker-compose.yml not found in $ProjectRoot"
    exit 1
}

# Setup environment function
function Setup-Environment {
    $envFile = Join-Path $ProjectRoot ".env"
    if (-not (Test-Path $envFile)) {
        Write-Info "Creating deployment environment file..."
        $envContent = @"
# CoatVision Deployment Environment Configuration
# Edit these values before deploying

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (required for dashboard)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
"@
        Set-Content -Path $envFile -Value $envContent
        Write-Success ".env file created"
        Write-Warning "Please edit .env with your API keys before deploying"
        return $false
    }
    return $true
}

# Run docker compose command
function Invoke-DockerCompose {
    param([string[]]$Arguments)
    
    if ($dockerComposeCmd -eq "docker compose") {
        & docker compose @Arguments
    } else {
        & docker-compose @Arguments
    }
}

# Execute command
switch ($Command) {
    "start" {
        Write-Info "Starting CoatVision services..."
        $envConfigured = Setup-Environment
        if (-not $envConfigured) {
            $response = Read-Host "Do you want to continue without configuring API keys? (y/n)"
            if ($response -notmatch "^[Yy]") {
                Write-Info "Please configure .env file and run again."
                exit 0
            }
        }
        
        $args = @("up", "--build")
        if ($Detach) {
            $args += "-d"
        }
        Invoke-DockerCompose -Arguments $args
        
        if ($Detach) {
            Write-Host ""
            Write-Success "Services started in background"
            Write-Info "Backend API: http://localhost:8000"
            Write-Info "Dashboard: http://localhost:3000"
            Write-Info "API Docs: http://localhost:8000/docs"
            Write-Host ""
            Write-Info "Use '.\deploy-all.ps1 -Command logs' to view logs"
            Write-Info "Use '.\deploy-all.ps1 -Command stop' to stop services"
        }
    }
    "stop" {
        Write-Info "Stopping CoatVision services..."
        Invoke-DockerCompose -Arguments @("down")
        Write-Success "Services stopped"
    }
    "restart" {
        Write-Info "Restarting CoatVision services..."
        Invoke-DockerCompose -Arguments @("down")
        $args = @("up", "--build")
        if ($Detach) {
            $args += "-d"
        }
        Invoke-DockerCompose -Arguments $args
        Write-Success "Services restarted"
    }
    "status" {
        Write-Info "CoatVision services status:"
        Write-Host ""
        Invoke-DockerCompose -Arguments @("ps")
    }
    "logs" {
        Write-Info "Showing logs (Ctrl+C to exit)..."
        Invoke-DockerCompose -Arguments @("logs", "-f")
    }
    "build" {
        Write-Info "Building Docker images..."
        Invoke-DockerCompose -Arguments @("build")
        Write-Success "Images built successfully"
    }
    "clean" {
        Write-Warning "This will remove all containers, volumes, and images for CoatVision."
        $response = Read-Host "Are you sure? (y/n)"
        if ($response -match "^[Yy]") {
            Write-Info "Cleaning up..."
            Invoke-DockerCompose -Arguments @("down", "-v", "--rmi", "all")
            Write-Success "Cleanup complete"
        } else {
            Write-Info "Cleanup cancelled"
        }
    }
    default {
        Write-Error "Unknown command: $Command"
        Print-Usage
        exit 1
    }
}
