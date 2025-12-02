#!/bin/bash

# CoatVision Docker Deployment Script
# This script handles Docker-based deployment of all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    log_info "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        log_success "Docker found: $DOCKER_VERSION"
    else
        log_error "Docker is not installed. Please install Docker."
        log_info "Download from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        log_success "Docker daemon is running"
    else
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    log_info "Checking Docker Compose installation..."
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        log_success "Docker Compose found: $COMPOSE_VERSION"
        COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version)
        log_success "Docker Compose (plugin) found: $COMPOSE_VERSION"
        COMPOSE_CMD="docker compose"
    else
        log_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
}

# Check for docker-compose.yml
check_compose_file() {
    log_info "Checking for docker-compose.yml..."
    
    if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        log_success "Found: docker-compose.yml"
    else
        log_warning "docker-compose.yml not found. Creating default..."
        create_compose_file
    fi
}

# Create docker-compose.yml
create_compose_file() {
    cat > "$PROJECT_ROOT/docker-compose.yml" << 'EOF'
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
EOF
    log_success "Created docker-compose.yml"
}

# Check for Dockerfiles
check_dockerfiles() {
    log_info "Checking for Dockerfiles..."
    
    # Check backend Dockerfile
    if [ -f "$PROJECT_ROOT/backend/Dockerfile" ]; then
        log_success "Found: backend/Dockerfile"
    else
        log_warning "backend/Dockerfile not found. Creating..."
        create_backend_dockerfile
    fi
    
    # Check frontend Dockerfile
    if [ -f "$PROJECT_ROOT/frontend/Dockerfile" ]; then
        log_success "Found: frontend/Dockerfile"
    else
        log_warning "frontend/Dockerfile not found. Creating..."
        create_frontend_dockerfile
    fi
}

# Create backend Dockerfile
create_backend_dockerfile() {
    mkdir -p "$PROJECT_ROOT/backend"
    cat > "$PROJECT_ROOT/backend/Dockerfile" << 'EOF'
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
EOF
    log_success "Created backend/Dockerfile"
}

# Create frontend Dockerfile
create_frontend_dockerfile() {
    mkdir -p "$PROJECT_ROOT/frontend"
    cat > "$PROJECT_ROOT/frontend/Dockerfile" << 'EOF'
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
EOF
    log_success "Created frontend/Dockerfile"
    
    # Also create nginx.conf if not exists
    if [ ! -f "$PROJECT_ROOT/frontend/nginx.conf" ]; then
        create_nginx_conf
    fi
}

# Create nginx.conf
create_nginx_conf() {
    cat > "$PROJECT_ROOT/frontend/nginx.conf" << 'EOF'
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
EOF
    log_success "Created frontend/nginx.conf"
}

# Build all services
build_services() {
    log_info "Building Docker services..."
    
    cd "$PROJECT_ROOT"
    
    $COMPOSE_CMD build
    
    if [ $? -eq 0 ]; then
        log_success "All services built successfully"
    else
        log_error "Failed to build services"
        exit 1
    fi
}

# Start all services
start_services() {
    log_info "Starting Docker services..."
    
    cd "$PROJECT_ROOT"
    
    $COMPOSE_CMD up -d
    
    if [ $? -eq 0 ]; then
        log_success "All services started successfully"
        echo ""
        log_info "Services are running at:"
        log_info "  Backend API: http://localhost:8000"
        log_info "  Frontend:    http://localhost:3000"
        echo ""
        log_info "Use '$0 logs' to view logs"
        log_info "Use '$0 stop' to stop services"
    else
        log_error "Failed to start services"
        exit 1
    fi
}

# Stop all services
stop_services() {
    log_info "Stopping Docker services..."
    
    cd "$PROJECT_ROOT"
    
    $COMPOSE_CMD down
    
    log_success "All services stopped"
}

# View logs
view_logs() {
    log_info "Viewing Docker service logs..."
    
    cd "$PROJECT_ROOT"
    
    SERVICE=${2:-}
    
    if [ -n "$SERVICE" ]; then
        $COMPOSE_CMD logs -f "$SERVICE"
    else
        $COMPOSE_CMD logs -f
    fi
}

# Check service status
check_status() {
    log_info "Checking Docker service status..."
    
    cd "$PROJECT_ROOT"
    
    $COMPOSE_CMD ps
}

# Clean up Docker resources
cleanup() {
    log_info "Cleaning up Docker resources..."
    
    cd "$PROJECT_ROOT"
    
    # Stop and remove containers
    $COMPOSE_CMD down -v --remove-orphans
    
    # Remove dangling images
    docker image prune -f
    
    log_success "Cleanup complete"
}

# Show usage information
show_usage() {
    echo "CoatVision Docker Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup       Check requirements and create Docker configuration files"
    echo "  build       Build all Docker services"
    echo "  start       Start all services (builds if needed)"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        View logs (optionally specify service: logs backend)"
    echo "  status      Check service status"
    echo "  cleanup     Stop services and clean up Docker resources"
    echo "  help        Show this help message"
    echo ""
    echo "If no command is provided, 'setup' will be executed."
}

# Main function
main() {
    echo "=========================================="
    echo "CoatVision Docker Deployment Script"
    echo "=========================================="
    echo ""
    
    COMMAND=${1:-setup}
    
    case $COMMAND in
        setup)
            check_docker
            check_docker_compose
            check_compose_file
            check_dockerfiles
            log_success "Docker setup complete!"
            echo ""
            log_info "To build services, run: $0 build"
            log_info "To start services, run: $0 start"
            ;;
        build)
            check_docker
            check_docker_compose
            check_compose_file
            check_dockerfiles
            build_services
            ;;
        start)
            check_docker
            check_docker_compose
            start_services
            ;;
        stop)
            check_docker
            check_docker_compose
            stop_services
            ;;
        restart)
            check_docker
            check_docker_compose
            stop_services
            start_services
            ;;
        logs)
            check_docker
            check_docker_compose
            view_logs "$@"
            ;;
        status)
            check_docker
            check_docker_compose
            check_status
            ;;
        cleanup)
            check_docker
            check_docker_compose
            cleanup
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
