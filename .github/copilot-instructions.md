# GitHub Copilot Instructions for CoatVision_MVP

## Project Overview

CoatVision is a coating analysis application with three main components:
- **Backend**: FastAPI-based REST API (Python 3.10+)
- **Dashboard**: React-based web frontend
- **Mobile**: React Native/Expo mobile application

The project uses OpenCV for image processing, OpenAI for AI capabilities, and generates PDF reports with ReportLab.

## Architecture

```
CoatVision_MVP/
├── backend/           # FastAPI backend (Python)
├── frontend/          # React dashboard (TypeScript/JavaScript)
├── mobile/            # React Native/Expo app
├── scripts/           # Automation scripts (.sh and .ps1)
├── tests/             # Test files
└── .github/workflows/ # CI/CD workflows
```

## Development Environment

### Prerequisites
- Python 3.10+ (3.11 recommended)
- Node.js 18+ (Node 20 recommended)
- Docker & Docker Compose (optional)
- Git

### Setup Commands

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm ci
npm run dev
```

**Mobile:**
```bash
cd mobile
npm ci
npm start
```

## Code Style and Conventions

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints for function parameters and return values
- Use black for code formatting, isort for import sorting, flake8 for linting
- Prefer FastAPI dependency injection over global state
- Use async/await for I/O operations where appropriate

### JavaScript/TypeScript (Frontend & Mobile)
- Follow configured ESLint and Prettier rules
- Use functional components and React hooks
- Prefer TypeScript for type safety
- Use meaningful variable and function names
- Keep components small and focused

### General
- Write clear, descriptive commit messages following Conventional Commits (e.g., `feat:`, `fix:`, `chore:`)
- Add comments only for complex logic or non-obvious code
- Keep functions small and single-purpose

## Testing Practices

### Backend Tests
- Run tests with: `pytest tests/ -v` from the backend directory
- Write tests for all API endpoints
- Use pytest fixtures for common test setup
- Mock external dependencies (OpenAI API, file system operations)
- Aim for high coverage on business logic

### Frontend Tests
- Run tests with: `npm test` from frontend directory
- Test components with React Testing Library
- Test user interactions and edge cases

### Mobile Tests
- Run tests with: `npm test` from mobile directory
- Test critical user flows

### CI Tests
All tests are run automatically in CI. Use the test script:
```bash
./scripts/run-tests.sh all      # All tests
./scripts/run-tests.sh backend  # Backend only
./scripts/run-tests.sh quick    # Quick validation
```

## Common Workflows

### Adding a New API Endpoint
1. Define the route in `backend/routers/`
2. Add any new models to `backend/models/`
3. Implement business logic in appropriate service modules
4. Add tests in `backend/tests/`
5. Update API documentation if needed

### Adding a Frontend Feature
1. Create components in `frontend/src/components/`
2. Add routes in the routing configuration
3. Implement API calls using the existing API client
4. Add tests for new components
5. Update documentation as needed

### Adding a Mobile Feature
1. Create components in `mobile/src/components/`
2. Use Expo APIs for native functionality
3. Handle API communication with axios
4. Test on both iOS and Android if possible

## CI/CD and GitHub Actions

### Workflow Patterns
- All workflows use minimal permissions (`permissions: contents: read`)
- Use `npm ci` when `package-lock.json` exists, otherwise use `npm install`
- Python dependencies are cached with `actions/cache@v4`
- Node dependencies use built-in caching in `actions/setup-node@v4`
- Checkout actions use `actions/checkout@v4`
- Always disable git pagers in CI: `git --no-pager`

### Running Workflows
- CI runs on push to `main` and `develop` branches
- CI runs on pull requests to `main` and `develop`
- Tests must pass before merging

## Environment Variables and Security

### Environment Variables
Create a `.env` file at the repository root (never commit this file):
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - Application secret for token signing
- `API_PORT` - Backend API port (default: 8000)
- `FRONTEND_PORT` - Frontend port (default: 3000)
- `NODE_ENV` - development/production
- `EXPO_PUBLIC_API_URL` - Backend API URL for mobile app

### Security Best Practices
- Never commit secrets, API keys, or credentials
- Keep `.env` in `.gitignore`
- Use environment variables for all sensitive configuration
- Validate and sanitize all user inputs
- Use HTTPS in production
- Keep dependencies up to date

## Automation Scripts

The repository includes shell scripts (`.sh`) and PowerShell scripts (`.ps1`) in the `scripts/` directory:
- `setup-backend.sh/.ps1` - Set up backend environment
- `setup-mobile.sh/.ps1` - Set up mobile environment
- `setup-dashboard.sh/.ps1` - Set up dashboard environment
- `run-tests.sh/.ps1` - Run tests for different components
- `deploy-all.sh/.ps1` - Deploy all services

Always make shell scripts executable: `chmod +x scripts/*.sh`

## Docker Usage

Build and run with Docker Compose:
```bash
docker compose build
docker compose up -d
docker compose logs -f
docker compose down
```

Use `docker-compose` (with hyphen) on older systems.

## Contributing

1. Create a feature branch: `git checkout -b feat/description` or `fix/description`
2. Make changes following the code style guidelines
3. Write or update tests for your changes
4. Run tests locally: `./scripts/run-tests.sh all`
5. Commit with clear messages following Conventional Commits
6. Push and open a Pull Request with a clear description

## Verification Checklist

After making changes, verify:
- [ ] Backend responds at http://localhost:8000
- [ ] Health check passes at http://localhost:8000/health
- [ ] Dashboard loads at http://localhost:3000
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] No secrets or sensitive data in commits
- [ ] Documentation is updated if needed

## Additional Resources

- See `README.md` for detailed setup instructions
- See `CONTRIBUTING.md` for contribution guidelines
- See `scripts/README.md` for automation script documentation
