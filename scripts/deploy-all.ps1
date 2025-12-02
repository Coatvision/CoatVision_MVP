# CoatVision Docker Deployment Script (PowerShell)
# This script handles Docker-based deployment of all services

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "build", "start", "stop", "restart", "logs", "status", "cleanup", "help")]
    [string]$Command = "setup",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

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

# Check if Docker is installed
function Test-Docker {
    Write-Info "Checking Docker installation..."
    
    try {
        $dockerVersion = & docker --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker found: $dockerVersion"
        } else {
            throw "Docker not found"
        }
    } catch {
        Write-ErrorMessage "Docker is not installed. Please install Docker."
        Write-Info "Download from: https://www.docker.com/products/docker-desktop"
        return $false
    }
    
    # Check if Docker daemon is running
    try {
        $null = & docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker daemon is running"
            return $true
        } else {
            throw "Docker daemon not running"
        }
    } catch {
        Write-ErrorMessage "Docker daemon is not running. Please start Docker."
        return $false
    }
}

# Check if Docker Compose is installed
function Test-DockerCompose {
    Write-Info "Checking Docker Compose installation..."
    
    # Try docker-compose first
    try {
        $composeVersion = & docker-compose --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Compose found: $composeVersion"
            $script:ComposeCmd = "docker-compose"
            return $true
        }
    } catch { }
    
    # Try docker compose (plugin)
    try {
        $composeVersion = & docker compose version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Compose (plugin) found: $composeVersion"
            $script:ComposeCmd = "docker compose"
            return $true
        }
    } catch { }
    
    Write-ErrorMessage "Docker Compose is not installed. Please install Docker Compose."
    return $false
}

# Check for docker-compose.yml
function Test-ComposeFile {
    Write-Info "Checking for docker-compose.yml..."
    
    $composeFile = Join-Path $ProjectRoot "docker-compose.yml"
    if (Test-Path $composeFile) {
        Write-Success "Found: docker-compose.yml"
    } else {
        Write-Warning "docker-compose.yml not found. Creating default..."
        New-ComposeFile
    }
}

# Create docker-compose.yml
function New-ComposeFile {
    $composeContent = @'
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - DEBUG=false
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/outputs:/app/outputs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:8000
    restart: unless-stopped

networks:
  default:
    name: coatvision-network

volumes:
  uploads:
  outputs:
'@
    $composeFile = Join-Path $ProjectRoot "docker-compose.yml"
    Set-Content -Path $composeFile -Value $composeContent
    Write-Success "Created docker-compose.yml"
}

# Check for Dockerfiles
function Test-Dockerfiles {
    Write-Info "Checking for Dockerfiles..."
    
    # Check backend Dockerfile
    $backendDockerfile = Join-Path $ProjectRoot "backend\Dockerfile"
    if (Test-Path $backendDockerfile) {
        Write-Success "Found: backend/Dockerfile"
    } else {
        Write-Warning "backend/Dockerfile not found. Creating..."
        New-BackendDockerfile
    }
    
    # Check frontend Dockerfile
    $frontendDockerfile = Join-Path $ProjectRoot "frontend\Dockerfile"
    if (Test-Path $frontendDockerfile) {
        Write-Success "Found: frontend/Dockerfile"
    } else {
        Write-Warning "frontend/Dockerfile not found. Creating..."
        New-FrontendDockerfile
    }
}

# Create backend Dockerfile
function New-BackendDockerfile {
    $backendDir = Join-Path $ProjectRoot "backend"
    if (-not (Test-Path $backendDir)) {
        New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
    }
    
    $dockerfileContent = @'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads outputs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
'@
    $dockerfilePath = Join-Path $backendDir "Dockerfile"
    Set-Content -Path $dockerfilePath -Value $dockerfileContent
    Write-Success "Created backend/Dockerfile"
}

# Create frontend Dockerfile
function New-FrontendDockerfile {
    $frontendDir = Join-Path $ProjectRoot "frontend"
    if (-not (Test-Path $frontendDir)) {
        New-Item -ItemType Directory -Path $frontendDir -Force | Out-Null
    }
    
    $dockerfileContent = @'
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
'@
    $dockerfilePath = Join-Path $frontendDir "Dockerfile"
    Set-Content -Path $dockerfilePath -Value $dockerfileContent
    Write-Success "Created frontend/Dockerfile"
    
    # Also create nginx.conf if not exists
    $nginxConf = Join-Path $frontendDir "nginx.conf"
    if (-not (Test-Path $nginxConf)) {
        New-NginxConf
    }
}

# Create nginx.conf
function New-NginxConf {
    $nginxContent = @'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # API proxy
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
'@
    $frontendDir = Join-Path $ProjectRoot "frontend"
    $nginxPath = Join-Path $frontendDir "nginx.conf"
    Set-Content -Path $nginxPath -Value $nginxContent
    Write-Success "Created frontend/nginx.conf"
}

# Build all services
function Build-Services {
    Write-Info "Building Docker services..."
    
    Set-Location $ProjectRoot
    
    if ($script:ComposeCmd -eq "docker compose") {
        & docker compose build
    } else {
        & docker-compose build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All services built successfully"
    } else {
        Write-ErrorMessage "Failed to build services"
        exit 1
    }
}

# Start all services
function Start-Services {
    Write-Info "Starting Docker services..."
    
    Set-Location $ProjectRoot
    
    if ($script:ComposeCmd -eq "docker compose") {
        & docker compose up -d
    } else {
        & docker-compose up -d
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All services started successfully"
        Write-Host ""
        Write-Info "Services are running at:"
        Write-Info "  Backend API: http://localhost:8000"
        Write-Info "  Frontend:    http://localhost:3000"
        Write-Host ""
        Write-Info "Use '.\deploy-all.ps1 logs' to view logs"
        Write-Info "Use '.\deploy-all.ps1 stop' to stop services"
    } else {
        Write-ErrorMessage "Failed to start services"
        exit 1
    }
}

# Stop all services
function Stop-Services {
    Write-Info "Stopping Docker services..."
    
    Set-Location $ProjectRoot
    
    if ($script:ComposeCmd -eq "docker compose") {
        & docker compose down
    } else {
        & docker-compose down
    }
    
    Write-Success "All services stopped"
}

# View logs
function Get-ServiceLogs {
    Write-Info "Viewing Docker service logs..."
    
    Set-Location $ProjectRoot
    
    if ($Service) {
        if ($script:ComposeCmd -eq "docker compose") {
            & docker compose logs -f $Service
        } else {
            & docker-compose logs -f $Service
        }
    } else {
        if ($script:ComposeCmd -eq "docker compose") {
            & docker compose logs -f
        } else {
            & docker-compose logs -f
        }
    }
}

# Check service status
function Get-ServiceStatus {
    Write-Info "Checking Docker service status..."
    
    Set-Location $ProjectRoot
    
    if ($script:ComposeCmd -eq "docker compose") {
        & docker compose ps
    } else {
        & docker-compose ps
    }
}

# Clean up Docker resources
function Invoke-Cleanup {
    Write-Info "Cleaning up Docker resources..."
    
    Set-Location $ProjectRoot
    
    # Stop and remove containers
    if ($script:ComposeCmd -eq "docker compose") {
        & docker compose down -v --remove-orphans
    } else {
        & docker-compose down -v --remove-orphans
    }
    
    # Remove dangling images
    & docker image prune -f
    
    Write-Success "Cleanup complete"
}

# Show usage information
function Show-Usage {
    Write-Host "CoatVision Docker Deployment Script"
    Write-Host ""
    Write-Host "Usage: .\deploy-all.ps1 [command] [service]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  setup       Check requirements and create Docker configuration files"
    Write-Host "  build       Build all Docker services"
    Write-Host "  start       Start all services (builds if needed)"
    Write-Host "  stop        Stop all services"
    Write-Host "  restart     Restart all services"
    Write-Host "  logs        View logs (optionally specify service: logs backend)"
    Write-Host "  status      Check service status"
    Write-Host "  cleanup     Stop services and clean up Docker resources"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "If no command is provided, 'setup' will be executed."
}

# Main function
function Main {
    Write-Host "=========================================="
    Write-Host "CoatVision Docker Deployment Script"
    Write-Host "=========================================="
    Write-Host ""
    
    switch ($Command) {
        "setup" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Test-ComposeFile
            Test-Dockerfiles
            Write-Success "Docker setup complete!"
            Write-Host ""
            Write-Info "To build services, run: .\deploy-all.ps1 build"
            Write-Info "To start services, run: .\deploy-all.ps1 start"
        }
        "build" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Test-ComposeFile
            Test-Dockerfiles
            Build-Services
        }
        "start" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Start-Services
        }
        "stop" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Stop-Services
        }
        "restart" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Stop-Services
            Start-Services
        }
        "logs" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Get-ServiceLogs
        }
        "status" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Get-ServiceStatus
        }
        "cleanup" {
            if (-not (Test-Docker)) { exit 1 }
            if (-not (Test-DockerCompose)) { exit 1 }
            Invoke-Cleanup
        }
        "help" {
            Show-Usage
        }
    }
}

Main
