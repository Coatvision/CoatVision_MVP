#!/bin/bash
# CoatVision local development startup script
# This script sets up and runs backend and frontend services

set -e

echo "==> CoatVision Development Setup"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "Error: Please run this script from the repository root"
    exit 1
fi

# Backend setup
echo -e "${GREEN}Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Copying .env.example to .env"
    cp .env.example .env
fi

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${YELLOW}Starting backend server...${NC}"
echo "Backend will run at http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Frontend setup (if exists)
if [ -d "frontend" ]; then
    echo -e "${GREEN}Setting up Frontend...${NC}"
    cd frontend

    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        echo "Copying .env.example to .env"
        cp .env.example .env
    fi

    echo "Installing Node dependencies..."
    if [ -f package-lock.json ]; then
        echo "Found package-lock.json — running npm ci"
        if ! npm ci; then
            echo "Warning: npm ci failed, falling back to npm install"
            npm install
        fi
    else
        echo "No package-lock.json found — running npm install"
        npm install
    fi

    echo -e "${YELLOW}Starting frontend server...${NC}"
    echo "Frontend will run at http://localhost:3000"
    npm start &
    FRONTEND_PID=$!

    cd ..
fi

# Mobile setup (if exists)
if [ -d "mobile" ]; then
    echo -e "${GREEN}Setting up Mobile...${NC}"
    cd mobile

    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        echo "Copying .env.example to .env"
        cp .env.example .env
    fi

    echo "Installing Node dependencies..."
    if [ -f package-lock.json ]; then
        echo "Found package-lock.json — running npm ci"
        if ! npm ci; then
            echo "Warning: npm ci failed, falling back to npm install"
            npm install
        fi
    else
        echo "No package-lock.json found — running npm install"
        npm install
    fi

    echo -e "${YELLOW}Note: To start mobile app, run: cd mobile && npm start${NC}"

    cd ..
fi

echo ""
echo -e "${GREEN}==> Development servers started!${NC}"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000 (if available)"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill ${BACKEND_PID:-} ${FRONTEND_PID:-} 2>/dev/null; exit" INT
wait
