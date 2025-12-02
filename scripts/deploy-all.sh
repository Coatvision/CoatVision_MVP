#!/bin/bash
# CoatVision Integrated System Deployment Script
# This script deploys all subsystems (Backend, Dashboard) using Docker Compose.
# Compatible with macOS and Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

print_banner() {
    echo ""
    echo "============================================"
    echo "   CoatVision Integrated Deployment"
    echo "============================================"
    echo ""
}

print_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services (default)"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show status of all services"
    echo "  logs        Show logs from all services"
    echo "  build       Build all Docker images"
    echo "  clean       Stop and remove all containers, volumes, and images"
    echo ""
    echo "Options:"
    echo "  -d, --detach    Run in detached mode"
    echo "  -h, --help      Show this help message"
    echo ""
}

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse arguments
COMMAND="${1:-start}"
DETACH=""

for arg in "$@"; do
    case $arg in
        -d|--detach)
            DETACH="-d"
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        start|stop|restart|status|logs|build|clean)
            COMMAND="$arg"
            ;;
    esac
done

print_banner

cd "$PROJECT_ROOT"
log_info "Working directory: $PROJECT_ROOT"

# Check Docker installation
log_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker."
    log_info "Download from: https://www.docker.com/get-started"
    exit 1
fi
log_success "Docker is installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Determine docker compose command
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi
log_success "Using: $DOCKER_COMPOSE"

# Check for docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml not found in $PROJECT_ROOT"
    exit 1
fi

# Configure environment
setup_environment() {
    ENV_FILE="$PROJECT_ROOT/.env"
    if [ ! -f "$ENV_FILE" ]; then
        log_info "Creating deployment environment file..."
        cat > "$ENV_FILE" << 'EOF'
# CoatVision Deployment Environment Configuration
# Edit these values before deploying

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (required for dashboard)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
        log_success ".env file created"
        log_warning "Please edit .env with your API keys before deploying"
        return 1
    fi
    return 0
}

# Execute command
case $COMMAND in
    start)
        log_info "Starting CoatVision services..."
        if ! setup_environment; then
            read -p "Do you want to continue without configuring API keys? (y/n): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Please configure .env file and run again."
                exit 0
            fi
        fi
        $DOCKER_COMPOSE up $DETACH --build
        if [ -n "$DETACH" ]; then
            echo ""
            log_success "Services started in background"
            log_info "Backend API: http://localhost:8000"
            log_info "Dashboard: http://localhost:3000"
            log_info "API Docs: http://localhost:8000/docs"
            echo ""
            log_info "Use '$0 logs' to view logs"
            log_info "Use '$0 stop' to stop services"
        fi
        ;;
    stop)
        log_info "Stopping CoatVision services..."
        $DOCKER_COMPOSE down
        log_success "Services stopped"
        ;;
    restart)
        log_info "Restarting CoatVision services..."
        $DOCKER_COMPOSE down
        $DOCKER_COMPOSE up $DETACH --build
        log_success "Services restarted"
        ;;
    status)
        log_info "CoatVision services status:"
        echo ""
        $DOCKER_COMPOSE ps
        ;;
    logs)
        log_info "Showing logs (Ctrl+C to exit)..."
        $DOCKER_COMPOSE logs -f
        ;;
    build)
        log_info "Building Docker images..."
        $DOCKER_COMPOSE build
        log_success "Images built successfully"
        ;;
    clean)
        log_warning "This will remove all containers, volumes, and images for CoatVision."
        read -p "Are you sure? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Cleaning up..."
            $DOCKER_COMPOSE down -v --rmi all
            log_success "Cleanup complete"
        else
            log_info "Cleanup cancelled"
        fi
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        print_usage
        exit 1
        ;;
esac
