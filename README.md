# CoatVision_MVP

CoatVision is a coating analysis application with a FastAPI backend, React dashboard, and React Native mobile app.

## Quick Start

### Prerequisites

- Python 3.10+ (3.11 recommended)
- Node.js 18+ (Node 20 recommended)
- Docker & Docker Compose (optional, for containerized deployment)
- Git

> Tip: Use pyenv and nvm to manage Python/Node versions across projects.

### Clone Repository

```bash
git clone https://github.com/Coatvision/CoatVision_MVP.git
cd CoatVision_MVP
```

### Automated Setup

We provide automation scripts for setting up all components. See `scripts/README.md` for detailed documentation.

#### Linux/macOS

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Set up backend
./scripts/setup-backend.sh setup

# Set up mobile app
./scripts/setup-mobile.sh setup

# Set up dashboard
./scripts/setup-dashboard.sh setup

# Run all tests
./scripts/run-tests.sh all
```

#### Windows (PowerShell)

Open PowerShell as Administrator on first run and (if needed) allow script execution:

```powershell
# Only if you need to change execution policy (Administrator):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

PowerShell instructions to create and activate the virtual environment and run scripts:

```powershell
# Create venv (from repository root)
python -m venv .venv
# Activate in PowerShell (Windows)
.\.venv\Scripts\Activate.ps1

# Install backend requirements (example)
cd backend
pip install -r requirements.txt

# Return to repository root
cd ..

# Run setup scripts (PowerShell versions provided in scripts/)
.\scripts\setup-backend.ps1 -Command setup
.\scripts\setup-dashboard.ps1 -Command setup
.\scripts\setup-mobile.ps1 -Command setup
```

If you prefer CMD instead of PowerShell, use:

```cmd
.venv\Scripts\activate.bat
```

### Docker Deployment (example)

You can run all services with Docker Compose. Create a `.env` file in the repository root (example provided below) and optionally a `docker-compose.override.yml` to customize service settings for local development.

Example .env:

```env
# .env (example)
DATABASE_URL=sqlite:///./data/dev.db
SECRET_KEY=your-secret-key
API_PORT=8000
FRONTEND_PORT=3000
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Example `docker-compose.override.yml` for local development:

```yaml
version: '3.8'
services:
  backend:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app/backend
  frontend:
    environment:
      - REACT_APP_API_URL=${EXPO_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app/frontend
```

Start containers:

```bash
# Build and start
docker compose build
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

If your system uses the older `docker-compose` command instead of `docker compose`, replace the command accordingly.

### Environment variables

Create a `.env` file at the repository root (example shown above). Common environment variables used across services:

- DATABASE_URL - Connection string for your database (e.g. Postgres or SQLite)
- SECRET_KEY - App secret used for signing tokens
- API_PORT - Port for the backend API (default: 8000)
- FRONTEND_PORT - Port for the frontend (default: 3000)
- NODE_ENV - development/production
- EXPO_PUBLIC_API_URL - Backend API URL consumed by mobile app

Be careful not to commit secrets. Add `.env` to `.gitignore` if not already present.

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

## Development

### Backend Development

```bash
cd backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows (PowerShell)
# .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port ${API_PORT:-8000}
```

### Frontend Development

Use Node.js 18+ (or Node 20). You can use corepack to ensure package manager consistency (pnpm/yarn) or rely on npm.

```bash
cd frontend
# install dependencies
npm ci
# start dev server
npm run dev
```

### Mobile Development

```bash
cd mobile
npm ci
npm start
```

## Testing

Run tests using the test script:

```bash
./scripts/run-tests.sh all      # All tests
./scripts/run-tests.sh backend  # Backend only
./scripts/run-tests.sh quick    # Quick validation
```

Or run backend tests directly with pytest:

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

## Continuous Integration (GitHub Actions)

This repository includes a basic CI workflow (`.github/workflows/ci.yml`) that:
- Installs Python and Node
- Installs dependencies for backend and frontend
- Runs backend tests with pytest and frontend build/tests

## Contributing

See `CONTRIBUTING.md` for guidelines on how to contribute, run tests locally, and open pull requests.

## Lokal utvikling

For å komme i gang med lokal utvikling første gang:

```bash
# 1. Kopier environment-eksempler (hvis de finnes)
cp backend/.env.example backend/.env 2>/dev/null || true
cp frontend/.env.example frontend/.env 2>/dev/null || true
cp mobile/.env.example mobile/.env 2>/dev/null || true

# 2. Installer Python-avhengigheter
cd backend
python3 -m venv .venv
source .venv/bin/activate  # På Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# 3. Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

# 4. Installer og start frontend (i ny terminal)
cd ../frontend
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm start &

# 5. Installer og start mobile (i ny terminal)
cd ../mobile
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm start
```

Alternativt kan du bruke det automatiske utviklingsskriptet:

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Dette skriptet setter opp alle tjenester og kopierer `.env.example`-filer automatisk.

## Verification Checklist

After setup, verify:

- [ ] Backend responds at http://localhost:8000
- [ ] Health check passes at http://localhost:8000/health
- [ ] Dashboard loads at http://localhost:3000
- [ ] All tests pass with `./scripts/run-tests.sh all`

## License

See LICENSE file for details.
