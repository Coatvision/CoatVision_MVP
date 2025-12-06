# CoatVision Automation Scripts

This directory contains automation scripts for setting up, deploying, and testing the CoatVision MVP application.

## Overview

The scripts are provided in both Bash (`.sh`) for Linux/macOS and PowerShell (`.ps1`) for Windows.

| Script | Purpose |
|--------|---------|
| `setup-backend.sh/.ps1` | Set up the Python/FastAPI backend |
| `setup-mobile.sh/.ps1` | Set up the React Native/Expo mobile app |
| `setup-dashboard.sh/.ps1` | Set up the React/Vite dashboard/frontend |
| `deploy-all.sh/.ps1` | Docker deployment for all services |
| `run-tests.sh/.ps1` | Run tests for all components |

## Prerequisites

### General
- Git (for cloning the repository)

### Backend
- Python 3.9 or higher
- pip (Python package manager)

### Mobile App
- Node.js 18 or higher
- npm (Node package manager)
- Expo CLI (installed automatically by scripts)
- For iOS development: macOS with Xcode
- For Android development: Android SDK

### Dashboard
- Node.js 18 or higher
- npm (Node package manager)

### Docker Deployment
- Docker Desktop or Docker Engine
- Docker Compose v2 (included with Docker Desktop)

## Quick Start

### Clone Repository

```bash
git clone https://github.com/Coatvision/CoatVision_MVP.git
cd CoatVision_MVP
```

### Linux/macOS

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Set up backend
./scripts/setup-backend.sh

# Set up mobile app
./scripts/setup-mobile.sh

# Set up dashboard
./scripts/setup-dashboard.sh

# Deploy with Docker
./scripts/deploy-all.sh
```

### Windows (PowerShell)

```powershell
# Set up backend
.\scripts\setup-backend.ps1

# Set up mobile app
.\scripts\setup-mobile.ps1

# Set up dashboard
.\scripts\setup-dashboard.ps1

# Deploy with Docker
.\scripts\deploy-all.ps1
```

## Script Details

### Backend Setup (`setup-backend.sh/.ps1`)

Sets up the Python FastAPI backend environment.

**Commands:**
- `setup` - Full setup (default): creates virtual environment, installs dependencies
- `install` - Install/update dependencies only
- `verify` - Verify configuration and dependencies
- `test` - Run backend tests
- `start` - Start the backend server on port 8000

**Example:**
```bash
./scripts/setup-backend.sh setup    # Full setup
./scripts/setup-backend.sh start    # Start server
./scripts/setup-backend.sh test     # Run tests
```

### Mobile Setup (`setup-mobile.sh/.ps1`)

Sets up the React Native/Expo mobile app environment.

**Commands:**
- `setup` - Full setup (default): installs dependencies, verifies configuration
- `install` - Install/update dependencies only
- `verify` - Verify configuration and platform tools
- `start` - Start the mobile app (development mode)
- `android` - Start for Android
- `ios` - Start for iOS (macOS only)
- `web` - Start for Web
- `lint` - Run linter

**Example:**
```bash
./scripts/setup-mobile.sh setup     # Full setup
./scripts/setup-mobile.sh start     # Start app
./scripts/setup-mobile.sh android   # Start for Android
```

### Dashboard Setup (`setup-dashboard.sh/.ps1`)

Sets up the React/Vite dashboard frontend.

**Commands:**
- `setup` - Full setup (default): installs dependencies, creates config files
- `install` - Install/update dependencies only
- `verify` - Verify configuration
- `start` - Start development server on port 3000
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Run linter

**Example:**
```bash
./scripts/setup-dashboard.sh setup  # Full setup
./scripts/setup-dashboard.sh start  # Start dev server
./scripts/setup-dashboard.sh build  # Production build
```

### Docker Deployment (`deploy-all.sh/.ps1`)

Deploys all services using Docker Compose.

**Commands:**
- `setup` - Check requirements, create Docker configuration files
- `build` - Build all Docker services
- `start` - Start all services
- `stop` - Stop all services
- `restart` - Restart all services
- `logs [service]` - View logs (optionally for specific service)
- `status` - Check service status
- `cleanup` - Stop services and clean up Docker resources

**Example:**
```bash
./scripts/deploy-all.sh setup   # Setup Docker files
./scripts/deploy-all.sh build   # Build containers
./scripts/deploy-all.sh start   # Start services
./scripts/deploy-all.sh logs    # View all logs
./scripts/deploy-all.sh logs backend  # View backend logs only
```

**Services:**
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000

### Test Runner (`run-tests.sh/.ps1`)

Runs tests across all components.

**Commands:**
- `all` - Run all tests (default)
- `backend` - Run backend tests only
- `frontend` - Run frontend/dashboard tests only
- `mobile` - Run mobile app tests only
- `docker` - Run Docker configuration tests only
- `api` - Test backend API health
- `quick` - Quick test (backend + docker validation)

**Example:**
```bash
./scripts/run-tests.sh all      # Run all tests
./scripts/run-tests.sh backend  # Backend tests only
./scripts/run-tests.sh quick    # Quick validation
```

## Troubleshooting

### Permission Denied (Linux/macOS)

```bash
chmod +x scripts/*.sh
```

### PowerShell Execution Policy (Windows)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Virtual Environment Issues

If the backend virtual environment is corrupted:
```bash
rm -rf backend/.venv
./scripts/setup-backend.sh setup
```

### Docker Issues

If Docker containers won't start:
```bash
./scripts/deploy-all.sh cleanup
./scripts/deploy-all.sh build
./scripts/deploy-all.sh start
```

### Node Modules Issues

If npm dependencies are corrupted:
```bash
rm -rf mobile/node_modules frontend/node_modules
./scripts/setup-mobile.sh install
./scripts/setup-dashboard.sh install
```

## Directory Structure

```
CoatVision_MVP/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── routers/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── mobile/
│   ├── src/
│   └── package.json
├── scripts/
│   ├── README.md
│   ├── setup-backend.sh/.ps1
│   ├── setup-mobile.sh/.ps1
│   ├── setup-dashboard.sh/.ps1
│   ├── deploy-all.sh/.ps1
│   └── run-tests.sh/.ps1
├── tests/
└── docker-compose.yml
```

## Verification Checklist

After running the setup scripts, verify:

- [ ] Backend server responds at http://localhost:8000
- [ ] Backend health check passes at http://localhost:8000/health
- [ ] Dashboard loads at http://localhost:3000 (when started)
- [ ] Mobile app starts with Expo
- [ ] All tests pass with `./scripts/run-tests.sh all`

## Contributing

When modifying scripts:

1. Test on both Linux/macOS and Windows
2. Update this README with any new commands
3. Ensure consistent behavior between .sh and .ps1 versions
