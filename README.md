# CoatVision MVP

A comprehensive coating analysis system with mobile app, backend API, and admin dashboard.

## Project Structure

```
CoatVision_MVP/
├── backend/          # FastAPI backend API
├── frontend/         # React admin dashboard
├── mobile/           # React Native mobile app
├── scripts/          # Automation scripts
├── tests/            # Test suite
└── docker-compose.yml
```

## Quick Start

### Option 1: Local Development

Use the automation scripts to set up each component:

```bash
# 1. Set up Backend API
./scripts/setup-backend.sh

# 2. Set up Dashboard (in new terminal)
./scripts/setup-dashboard.sh

# 3. Set up Mobile App (in new terminal)
./scripts/setup-mobile.sh
```

### Option 2: Docker Deployment

Deploy all services with Docker:

```bash
# Start all services
./scripts/deploy-all.sh start -d

# View logs
./scripts/deploy-all.sh logs

# Stop services
./scripts/deploy-all.sh stop
```

## Services

| Service | Local URL | Description |
|---------|-----------|-------------|
| Backend API | http://localhost:8000 | FastAPI backend |
| API Docs | http://localhost:8000/docs | Swagger documentation |
| Dashboard | http://localhost:3000 | Admin dashboard |

## Automation Scripts

Cross-platform scripts for Windows, macOS, and Linux:

| Script | Description |
|--------|-------------|
| `scripts/setup-backend.sh/ps1` | Backend API setup |
| `scripts/setup-mobile.sh/ps1` | Mobile app setup |
| `scripts/setup-dashboard.sh/ps1` | Dashboard setup |
| `scripts/deploy-all.sh/ps1` | Docker deployment |
| `scripts/run-tests.sh/ps1` | Test automation |

See [scripts/README.md](scripts/README.md) for detailed documentation.

## Testing

Run the automated test suite:

```bash
# Run all tests
./scripts/run-tests.sh

# Run specific tests
./scripts/run-tests.sh --backend
./scripts/run-tests.sh --integration
```

## Requirements

- **Backend**: Python 3.8+
- **Frontend/Mobile**: Node.js 18+
- **Docker Deployment**: Docker & Docker Compose

## License

Private - All rights reserved.
