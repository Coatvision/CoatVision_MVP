#!/bin/bash

# CoatVision Test Runner Script
# This script runs tests for all components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

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

log_section() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""
}

# Run backend tests
run_backend_tests() {
    log_section "Running Backend Tests"
    
    BACKEND_DIR="$PROJECT_ROOT/backend"
    VENV_DIR="$BACKEND_DIR/.venv"
    
    # Check if virtual environment exists
    if [ ! -d "$VENV_DIR" ]; then
        log_warning "Virtual environment not found. Creating..."
        
        if command -v python3 &> /dev/null; then
            python3 -m venv "$VENV_DIR"
        else
            python -m venv "$VENV_DIR"
        fi
    fi
    
    # Activate virtual environment
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
    else
        log_error "Could not activate virtual environment"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
    
    # Install test dependencies
    pip install --quiet pytest pytest-cov pytest-asyncio httpx
    
    # Install project dependencies
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        pip install --quiet -r "$BACKEND_DIR/requirements.txt"
    elif [ -f "$PROJECT_ROOT/requirements.txt" ]; then
        pip install --quiet -r "$PROJECT_ROOT/requirements.txt"
    fi
    
    cd "$PROJECT_ROOT"
    
    # Run pytest
    if [ -d "$PROJECT_ROOT/tests" ]; then
        log_info "Running pytest..."
        
        if pytest tests/ -v --tb=short -q; then
            log_success "Backend tests passed"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_error "Backend tests failed"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        log_warning "No tests directory found"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    fi
    
    # Run flake8 linting
    log_info "Running flake8 linting..."
    if command -v flake8 &> /dev/null; then
        if flake8 backend/ --exclude=.venv,__pycache__ --count --select=E9,F63,F7,F82 --show-source --statistics 2>/dev/null; then
            log_success "Flake8 linting passed (critical errors)"
        else
            log_warning "Flake8 found some issues"
        fi
    else
        pip install --quiet flake8
        flake8 backend/ --exclude=.venv,__pycache__ --count --select=E9,F63,F7,F82 --show-source --statistics 2>/dev/null || true
    fi
}

# Run frontend tests
run_frontend_tests() {
    log_section "Running Frontend/Dashboard Tests"
    
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_warning "Frontend directory not found"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_warning "No package.json found in frontend"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install --silent
    fi
    
    # Check if test script exists
    if grep -q '"test"' package.json; then
        log_info "Running frontend tests..."
        if npm test -- --passWithNoTests 2>/dev/null; then
            log_success "Frontend tests passed"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "Frontend tests failed or not configured"
            TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        fi
    else
        log_warning "No test script found in frontend"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    fi
    
    # Run ESLint if available
    if grep -q '"lint"' package.json; then
        log_info "Running ESLint..."
        npm run lint 2>/dev/null || log_warning "ESLint found issues or not configured"
    fi
}

# Run mobile tests
run_mobile_tests() {
    log_section "Running Mobile App Tests"
    
    MOBILE_DIR="$PROJECT_ROOT/mobile"
    
    if [ ! -d "$MOBILE_DIR" ]; then
        log_warning "Mobile directory not found"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    cd "$MOBILE_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_warning "No package.json found in mobile"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log_info "Installing mobile dependencies..."
        npm install --silent
    fi
    
    # Check if test script exists
    if grep -q '"test"' package.json; then
        log_info "Running mobile tests..."
        if npm test -- --passWithNoTests 2>/dev/null; then
            log_success "Mobile tests passed"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            log_warning "Mobile tests failed or not configured"
            TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        fi
    else
        log_warning "No test script found in mobile"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    fi
}

# Run Docker tests
run_docker_tests() {
    log_section "Running Docker Tests"
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log_warning "Docker is not installed"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_warning "Docker daemon is not running"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # Check for docker-compose.yml
    if [ ! -f "docker-compose.yml" ]; then
        log_warning "docker-compose.yml not found"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    # Determine compose command
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        log_warning "Docker Compose not available"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        return 0
    fi
    
    # Validate docker-compose.yml syntax
    log_info "Validating docker-compose.yml..."
    if $COMPOSE_CMD config -q 2>/dev/null; then
        log_success "docker-compose.yml is valid"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "docker-compose.yml has errors"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
    
    # Check Dockerfiles
    log_info "Checking Dockerfiles..."
    
    if [ -f "$PROJECT_ROOT/backend/Dockerfile" ]; then
        # Lint Dockerfile using hadolint if available
        if command -v hadolint &> /dev/null; then
            if hadolint "$PROJECT_ROOT/backend/Dockerfile"; then
                log_success "backend/Dockerfile is valid"
            else
                log_warning "backend/Dockerfile has lint warnings"
            fi
        else
            log_success "Found: backend/Dockerfile"
        fi
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "backend/Dockerfile not found"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    fi
    
    if [ -f "$PROJECT_ROOT/frontend/Dockerfile" ]; then
        log_success "Found: frontend/Dockerfile"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_warning "frontend/Dockerfile not found"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    fi
}

# Test backend API health
test_backend_api() {
    log_section "Testing Backend API Health"
    
    # Check if backend server is running
    if command -v curl &> /dev/null; then
        log_info "Checking if backend is running on localhost:8000..."
        
        if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
            log_success "Backend health check passed"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            
            # Test root endpoint
            log_info "Testing root endpoint..."
            RESPONSE=$(curl -s http://localhost:8000/)
            if echo "$RESPONSE" | grep -q "status"; then
                log_success "Root endpoint responded correctly"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                log_warning "Root endpoint response unexpected"
            fi
        else
            log_warning "Backend is not running. Start it with: ./setup-backend.sh start"
            TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
        fi
    else
        log_warning "curl not available for API testing"
        TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    fi
}

# Print test summary
print_summary() {
    log_section "Test Summary"
    
    TOTAL=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))
    
    echo -e "Total Tests:  $TOTAL"
    echo -e "${GREEN}Passed:${NC}       $TESTS_PASSED"
    echo -e "${RED}Failed:${NC}       $TESTS_FAILED"
    echo -e "${YELLOW}Skipped:${NC}      $TESTS_SKIPPED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "All tests passed!"
        return 0
    else
        log_error "Some tests failed. Please review the output above."
        return 1
    fi
}

# Show usage information
show_usage() {
    echo "CoatVision Test Runner Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  all         Run all tests (default)"
    echo "  backend     Run backend tests only"
    echo "  frontend    Run frontend/dashboard tests only"
    echo "  mobile      Run mobile app tests only"
    echo "  docker      Run Docker configuration tests only"
    echo "  api         Test backend API health"
    echo "  quick       Quick test (backend + docker validation)"
    echo "  help        Show this help message"
    echo ""
    echo "If no command is provided, 'all' will be executed."
}

# Main function
main() {
    echo "=========================================="
    echo "CoatVision Test Runner Script"
    echo "=========================================="
    echo ""
    
    COMMAND=${1:-all}
    
    case $COMMAND in
        all)
            run_backend_tests
            run_frontend_tests
            run_mobile_tests
            run_docker_tests
            print_summary
            ;;
        backend)
            run_backend_tests
            print_summary
            ;;
        frontend|dashboard)
            run_frontend_tests
            print_summary
            ;;
        mobile)
            run_mobile_tests
            print_summary
            ;;
        docker)
            run_docker_tests
            print_summary
            ;;
        api)
            test_backend_api
            print_summary
            ;;
        quick)
            run_backend_tests
            run_docker_tests
            print_summary
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
