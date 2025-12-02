# CoatVision_MVP

CoatVision is a coating analysis application with a FastAPI backend, React dashboard, and React Native mobile app.

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Docker (optional, for containerized deployment)

### Clone Repository

```bash
git clone https://github.com/Coatvision/CoatVision_MVP.git
cd CoatVision_MVP
```

### Automated Setup

We provide automation scripts for setting up all components. See [scripts/README.md](scripts/README.md) for detailed documentation.

#### Linux/macOS

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Set up backend
./scripts/setup-backend.sh

# Set up mobile app
./scripts/setup-mobile.sh

# Set up dashboard
./scripts/setup-dashboard.sh

# Run all tests
./scripts/run-tests.sh
```

#### Windows (PowerShell)

```powershell
# Set up backend
.\scripts\setup-backend.ps1

# Set up mobile app
.\scripts\setup-mobile.ps1

# Set up dashboard
.\scripts\setup-dashboard.ps1

# Run all tests
.\scripts\run-tests.ps1
```

### Docker Deployment

Deploy all services with Docker:

```bash
# Linux/macOS
./scripts/deploy-all.sh start

# Windows
.\scripts\deploy-all.ps1 start
```

Services will be available at:
- Backend API: http://localhost:8000
- Frontend Dashboard: http://localhost:3000

## Project Structure

```
CoatVision_MVP/
├── backend/           # FastAPI backend
│   ├── main.py
│   ├── routers/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/          # React dashboard
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── mobile/            # React Native/Expo app
│   ├── src/
│   └── package.json
├── scripts/           # Automation scripts
│   ├── setup-backend.sh/.ps1
│   ├── setup-mobile.sh/.ps1
│   ├── setup-dashboard.sh/.ps1
│   ├── deploy-all.sh/.ps1
│   ├── run-tests.sh/.ps1
│   └── README.md
├── tests/             # Test files
├── docker-compose.yml # Docker configuration
└── README.md
```

## Automation Scripts

| Script | Purpose |
|--------|---------|
| `setup-backend` | Set up Python/FastAPI backend environment |
| `setup-mobile` | Set up React Native/Expo mobile app |
| `setup-dashboard` | Set up React/Vite dashboard |
| `deploy-all` | Docker deployment for all services |
| `run-tests` | Run tests for all components |

### Script Commands

Each script supports multiple commands. Use `help` to see all options:

```bash
./scripts/setup-backend.sh help
./scripts/deploy-all.sh help
./scripts/run-tests.sh help
```

### Common Commands

```bash
# Backend
./scripts/setup-backend.sh setup    # Full setup
./scripts/setup-backend.sh start    # Start server
./scripts/setup-backend.sh test     # Run tests

# Docker
./scripts/deploy-all.sh build       # Build containers
./scripts/deploy-all.sh start       # Start services
./scripts/deploy-all.sh logs        # View logs
./scripts/deploy-all.sh stop        # Stop services

# Tests
./scripts/run-tests.sh all          # Run all tests
./scripts/run-tests.sh backend      # Backend tests only
./scripts/run-tests.sh docker       # Docker validation
```

## API Endpoints

The backend provides the following API endpoints:

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/analyze` - Image analysis
- `POST /api/lyxbot` - AI assistant
- `GET /api/jobs` - Job management
- `POST /api/calibration` - Calibration
- `POST /api/wash` - Wash analysis
- `GET /api/report` - Report generation

## Development

### Backend Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Mobile Development

```bash
cd mobile
npm install
npm start
```

## Testing

Run tests using the test script:

```bash
./scripts/run-tests.sh all      # All tests
./scripts/run-tests.sh backend  # Backend only
./scripts/run-tests.sh quick    # Quick validation
```

Or run directly with pytest:

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

## Verification Checklist

After setup, verify:

- [ ] Backend responds at http://localhost:8000
- [ ] Health check passes at http://localhost:8000/health
- [ ] Dashboard loads at http://localhost:3000
- [ ] All tests pass with `./scripts/run-tests.sh all`

## License

See LICENSE file for details.
