#!/bin/bash

# CoatVision Backend Setup Script
# This script sets up the backend development environment

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
BACKEND_DIR="$PROJECT_ROOT/backend"

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

# Check if Python is installed
check_python() {
    log_info "Checking Python installation..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        log_success "Python found: $PYTHON_VERSION"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2)
        log_success "Python found: $PYTHON_VERSION"
    else
        log_error "Python is not installed. Please install Python 3.9 or higher."
        exit 1
    fi
    
    # Check Python version is at least 3.9
    MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    
    if [ "$MAJOR" -lt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -lt 9 ]); then
        log_error "Python 3.9 or higher is required. Found: $PYTHON_VERSION"
        exit 1
    fi
}

# Check if pip is installed
check_pip() {
    log_info "Checking pip installation..."
    
    if command -v pip3 &> /dev/null; then
        PIP_CMD="pip3"
        log_success "pip3 found"
    elif command -v pip &> /dev/null; then
        PIP_CMD="pip"
        log_success "pip found"
    else
        log_error "pip is not installed. Please install pip."
        exit 1
    fi
}

# Create virtual environment
create_venv() {
    log_info "Creating virtual environment..."
    
    VENV_DIR="$BACKEND_DIR/.venv"
    
    if [ -d "$VENV_DIR" ]; then
        log_warning "Virtual environment already exists. Removing..."
        rm -rf "$VENV_DIR"
    fi
    
    $PYTHON_CMD -m venv "$VENV_DIR"
    log_success "Virtual environment created at $VENV_DIR"
}

# Activate virtual environment and install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    VENV_DIR="$BACKEND_DIR/.venv"
    
    # Activate virtual environment
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
    else
        log_error "Could not find virtual environment activation script"
        exit 1
    fi
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install dependencies from backend requirements
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        log_info "Installing dependencies from backend/requirements.txt..."
        pip install -r "$BACKEND_DIR/requirements.txt"
    elif [ -f "$PROJECT_ROOT/requirements.txt" ]; then
        log_info "Installing dependencies from requirements.txt..."
        pip install -r "$PROJECT_ROOT/requirements.txt"
    else
        log_warning "No requirements.txt found. Skipping dependency installation."
    fi
    
    # Install development dependencies
    log_info "Installing development dependencies..."
    pip install pytest pytest-cov flake8 black
    
    log_success "Dependencies installed successfully"
}

# Verify configuration
verify_config() {
    log_info "Verifying configuration..."
    
    # Check for required files
    REQUIRED_FILES=(
        "$BACKEND_DIR/main.py"
        "$BACKEND_DIR/requirements.txt"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_success "Found: $file"
        else
            log_warning "Missing: $file"
        fi
    done
    
    # Check for required directories
    REQUIRED_DIRS=(
        "$BACKEND_DIR/routers"
        "$BACKEND_DIR/api"
    )
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            log_success "Found directory: $dir"
        else
            log_warning "Missing directory: $dir"
        fi
    done
}

# Run backend tests
run_tests() {
    log_info "Running backend tests..."
    
    VENV_DIR="$BACKEND_DIR/.venv"
    
    # Activate virtual environment
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
    fi
    
    cd "$PROJECT_ROOT"
    
    if [ -d "$PROJECT_ROOT/tests" ]; then
        pytest tests/ -v --tb=short || {
            log_warning "Some tests failed. Check the output above."
            return 1
        }
        log_success "All tests passed"
    else
        log_warning "No tests directory found. Skipping tests."
    fi
}

# Start the backend server
start_server() {
    log_info "Starting the backend server..."
    
    VENV_DIR="$BACKEND_DIR/.venv"
    
    # Activate virtual environment
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
    fi
    
    cd "$BACKEND_DIR"
    
    log_info "Backend server starting on http://localhost:8000"
    log_info "Press Ctrl+C to stop the server"
    
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

# Show usage information
show_usage() {
    echo "CoatVision Backend Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup       Full setup: check dependencies, create venv, install packages"
    echo "  install     Install/update dependencies only"
    echo "  verify      Verify configuration and dependencies"
    echo "  test        Run backend tests"
    echo "  start       Start the backend server"
    echo "  help        Show this help message"
    echo ""
    echo "If no command is provided, 'setup' will be executed."
}

# Main function
main() {
    echo "=========================================="
    echo "CoatVision Backend Setup Script"
    echo "=========================================="
    echo ""
    
    COMMAND=${1:-setup}
    
    case $COMMAND in
        setup)
            check_python
            check_pip
            create_venv
            install_dependencies
            verify_config
            log_success "Backend setup complete!"
            echo ""
            log_info "To start the server, run: $0 start"
            log_info "To run tests, run: $0 test"
            ;;
        install)
            check_python
            check_pip
            install_dependencies
            ;;
        verify)
            check_python
            check_pip
            verify_config
            ;;
        test)
            run_tests
            ;;
        start)
            start_server
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
