#!/bin/bash

# CoatVision Dashboard Setup Script
# This script sets up the dashboard/frontend development environment

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
FRONTEND_DIR="$PROJECT_ROOT/frontend"

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

# Check if Node.js is installed
check_node() {
    log_info "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js found: $NODE_VERSION"
        
        # Check if version is at least 18
        MAJOR=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
        if [ "$MAJOR" -lt 18 ]; then
            log_warning "Node.js 18 or higher is recommended. Found: $NODE_VERSION"
        fi
    else
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
        log_info "Download from: https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    log_info "Checking npm installation..."
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm found: $NPM_VERSION"
    else
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check frontend directory exists
check_frontend_directory() {
    log_info "Checking frontend directory..."
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "Frontend directory not found at: $FRONTEND_DIR"
        exit 1
    fi
    
    log_success "Frontend directory found"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dashboard dependencies..."
    
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_warning "No package.json found. Creating a basic one..."
        
        # Create a basic package.json for the frontend
        cat > package.json << 'EOF'
{
  "name": "coatvision-dashboard",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
EOF
        log_success "Created package.json"
    fi
    
    # Remove node_modules if exists for clean install
    if [ -d "node_modules" ]; then
        log_info "Removing existing node_modules..."
        rm -rf node_modules
    fi
    
    # Remove package-lock.json for clean install
    if [ -f "package-lock.json" ]; then
        log_info "Removing existing package-lock.json..."
        rm -f package-lock.json
    fi
    
    # Install dependencies
    npm install
    
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
}

# Verify configuration
verify_config() {
    log_info "Verifying dashboard configuration..."
    
    cd "$FRONTEND_DIR"
    
    # Check for required files
    REQUIRED_FILES=(
        "package.json"
        "src/App.jsx"
        "src/main.jsx"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_success "Found: $file"
        else
            log_warning "Missing: $file"
        fi
    done
    
    # Check for vite config
    if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
        log_success "Found Vite configuration"
    else
        log_warning "Missing Vite configuration. Creating default..."
        create_vite_config
    fi
    
    # Check for index.html
    if [ -f "index.html" ]; then
        log_success "Found: index.html"
    else
        log_warning "Missing: index.html. Creating default..."
        create_index_html
    fi
}

# Create Vite configuration
create_vite_config() {
    cat > "$FRONTEND_DIR/vite.config.js" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOF
    log_success "Created vite.config.js"
}

# Create index.html
create_index_html() {
    cat > "$FRONTEND_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CoatVision Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
    log_success "Created index.html"
}

# Start the dashboard in development mode
start_dev() {
    log_info "Starting dashboard in development mode..."
    
    cd "$FRONTEND_DIR"
    
    log_info "Dashboard starting on http://localhost:3000"
    log_info "Press Ctrl+C to stop"
    
    npm run dev
}

# Build for production
build_production() {
    log_info "Building dashboard for production..."
    
    cd "$FRONTEND_DIR"
    
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Production build complete"
        log_info "Build output is in: $FRONTEND_DIR/dist"
    else
        log_error "Production build failed"
        exit 1
    fi
}

# Preview production build
preview_build() {
    log_info "Previewing production build..."
    
    cd "$FRONTEND_DIR"
    
    if [ ! -d "dist" ]; then
        log_error "No production build found. Run 'build' first."
        exit 1
    fi
    
    npm run preview
}

# Run linting
run_lint() {
    log_info "Running linter..."
    
    cd "$FRONTEND_DIR"
    
    if grep -q '"lint"' package.json 2>/dev/null; then
        npm run lint
    else
        log_warning "No lint script found. Running eslint directly..."
        if command -v npx &> /dev/null; then
            npx eslint src/ --ext .js,.jsx,.ts,.tsx || log_warning "ESLint not configured or failed"
        fi
    fi
}

# Show usage information
show_usage() {
    echo "CoatVision Dashboard Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup       Full setup: check dependencies, install packages"
    echo "  install     Install/update dependencies only"
    echo "  verify      Verify configuration and dependencies"
    echo "  start       Start the dashboard (development mode)"
    echo "  build       Build for production"
    echo "  preview     Preview production build"
    echo "  lint        Run linter"
    echo "  help        Show this help message"
    echo ""
    echo "If no command is provided, 'setup' will be executed."
}

# Main function
main() {
    echo "=========================================="
    echo "CoatVision Dashboard Setup Script"
    echo "=========================================="
    echo ""
    
    COMMAND=${1:-setup}
    
    case $COMMAND in
        setup)
            check_node
            check_npm
            check_frontend_directory
            install_dependencies
            verify_config
            log_success "Dashboard setup complete!"
            echo ""
            log_info "To start the dashboard, run: $0 start"
            log_info "To build for production, run: $0 build"
            ;;
        install)
            check_node
            check_npm
            check_frontend_directory
            install_dependencies
            ;;
        verify)
            check_node
            check_npm
            check_frontend_directory
            verify_config
            ;;
        start)
            start_dev
            ;;
        build)
            build_production
            ;;
        preview)
            preview_build
            ;;
        lint)
            run_lint
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
