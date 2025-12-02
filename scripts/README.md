# CoatVision Automation Scripts

This directory contains cross-platform automation scripts to simplify setup, deployment, and testing of the CoatVision system.

## Available Scripts

| Script | Description |
|--------|-------------|
| `setup-backend.sh/ps1` | Set up the Backend API |
| `setup-mobile.sh/ps1` | Set up the React Native Mobile App |
| `setup-dashboard.sh/ps1` | Set up the Admin Dashboard |
| `deploy-all.sh/ps1` | Deploy all services using Docker |
| `run-tests.sh/ps1` | Run automated tests |

## Prerequisites

### For Backend API
- Python 3.8 or higher
- pip (Python package manager)

### For Mobile App
- Node.js 18 or higher
- npm (Node package manager)
- Expo Go app on your mobile device (for testing)

### For Dashboard
- Node.js 18 or higher
- npm (Node package manager)

### For Docker Deployment
- Docker
- Docker Compose

---

## 1. Backend API Setup

Sets up the FastAPI backend server with all dependencies.

### macOS/Linux
```bash
./scripts/setup-backend.sh
```

### Windows PowerShell
```powershell
.\scripts\setup-backend.ps1
```

### What it does:
- Checks Python installation
- Creates a virtual environment
- Installs Python dependencies from `requirements.txt`
- Creates `.env` file with configuration template
- Creates necessary directories (`uploads/`, `outputs/`)
- Optionally starts the development server

### After setup:
The backend API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 2. Mobile App Setup

Sets up the React Native mobile app using Expo.

### macOS/Linux
```bash
./scripts/setup-mobile.sh
```

### Windows PowerShell
```powershell
.\scripts\setup-mobile.ps1
```

### What it does:
- Checks Node.js and npm installation
- Installs npm dependencies
- Creates `.env` file with API endpoint configuration
- Creates `app.json` if not present
- Detects your local IP for physical device testing
- Optionally starts Expo development server

### After setup:
- Scan the QR code with Expo Go app on your device
- Or use: `npx expo start --android` / `npx expo start --ios`

### API Configuration
Edit `mobile/.env` to configure the backend API URL:
```
# For Android emulator
EXPO_PUBLIC_API_BASE=http://10.0.2.2:8000/api

# For iOS simulator
EXPO_PUBLIC_API_BASE=http://localhost:8000/api

# For physical device (use your computer's IP)
EXPO_PUBLIC_API_BASE=http://192.168.1.100:8000/api
```

---

## 3. Dashboard Setup

Sets up the React admin dashboard with Vite.

### macOS/Linux
```bash
./scripts/setup-dashboard.sh
```

### Windows PowerShell
```powershell
.\scripts\setup-dashboard.ps1
```

### What it does:
- Checks Node.js and npm installation
- Installs npm dependencies
- Creates `.env.local` file with configuration template
- Optionally starts the development server

### After setup:
The dashboard will be available at: http://localhost:3000

### Configuration
Edit `frontend/.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 4. Integrated Deployment

Deploys all services using Docker Compose.

### macOS/Linux
```bash
# Start all services
./scripts/deploy-all.sh start

# Start in background
./scripts/deploy-all.sh start -d

# Stop all services
./scripts/deploy-all.sh stop

# View logs
./scripts/deploy-all.sh logs

# Check status
./scripts/deploy-all.sh status

# Rebuild and restart
./scripts/deploy-all.sh restart

# Clean up everything
./scripts/deploy-all.sh clean
```

### Windows PowerShell
```powershell
# Start all services
.\scripts\deploy-all.ps1 -Command start

# Start in background
.\scripts\deploy-all.ps1 -Command start -Detach

# Stop all services
.\scripts\deploy-all.ps1 -Command stop

# View logs
.\scripts\deploy-all.ps1 -Command logs

# Check status
.\scripts\deploy-all.ps1 -Command status

# Rebuild and restart
.\scripts\deploy-all.ps1 -Command restart

# Clean up everything
.\scripts\deploy-all.ps1 -Command clean
```

### What it does:
- Creates `.env` file if not exists
- Builds Docker images for backend and dashboard
- Starts all services with Docker Compose
- Sets up networking between services

### After deployment:
- **Backend API**: http://localhost:8000
- **Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

---

## 5. Test Automation

Runs automated tests for the entire system.

### macOS/Linux
```bash
# Run all tests
./scripts/run-tests.sh

# Run backend tests only
./scripts/run-tests.sh --backend

# Run integration tests only
./scripts/run-tests.sh --integration

# Test against specific URL
./scripts/run-tests.sh --url http://localhost:8000
```

### Windows PowerShell
```powershell
# Run all tests
.\scripts\run-tests.ps1

# Run backend tests only
.\scripts\run-tests.ps1 -Backend

# Run integration tests only
.\scripts\run-tests.ps1 -Integration

# Test against specific URL
.\scripts\run-tests.ps1 -Url http://localhost:8000
```

### What it tests:
- Backend API health endpoint
- API version and structure
- Endpoint availability
- Response times
- Python unit tests (if available)
- Integration between services

---

## Quick Start Guide

### Development Setup (Local)

1. **Start the Backend:**
   ```bash
   ./scripts/setup-backend.sh
   ```

2. **Start the Dashboard (in a new terminal):**
   ```bash
   ./scripts/setup-dashboard.sh
   ```

3. **Start the Mobile App (in a new terminal):**
   ```bash
   ./scripts/setup-mobile.sh
   ```

4. **Run Tests:**
   ```bash
   ./scripts/run-tests.sh
   ```

### Production Deployment (Docker)

1. **Configure Environment:**
   Edit `.env` in the project root with your API keys.

2. **Deploy:**
   ```bash
   ./scripts/deploy-all.sh start -d
   ```

3. **Verify:**
   ```bash
   ./scripts/run-tests.sh
   ```

---

## Troubleshooting

### Python not found
Install Python 3.8+ from https://www.python.org/downloads/

### Node.js not found
Install Node.js 18+ from https://nodejs.org/

### Docker not found
Install Docker Desktop from https://www.docker.com/get-started

### Permission denied (macOS/Linux)
```bash
chmod +x scripts/*.sh
```

### PowerShell execution policy (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port already in use
- Backend (8000): `lsof -i :8000` / `netstat -ano | findstr :8000`
- Dashboard (3000): `lsof -i :3000` / `netstat -ano | findstr :3000`

### Backend not responding
1. Check if the server is running
2. Verify the port is not blocked by firewall
3. Check `.env` configuration

---

## Environment Files

| File | Location | Purpose |
|------|----------|---------|
| `.env` | `backend/` | Backend configuration |
| `.env` | `mobile/` | Mobile app API endpoint |
| `.env.local` | `frontend/` | Dashboard configuration |
| `.env` | Project root | Docker deployment config |

---

## Support

For issues and questions, please check the main [README.md](../README.md) or open an issue on GitHub.
