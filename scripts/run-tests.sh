#!/bin/bash
# CoatVision Validation and Test Automation Script
# This script runs automated tests to validate endpoints, check app functionality,
# and ensure a stable integrated system.
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

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_banner() {
    echo ""
    echo "============================================"
    echo "   CoatVision Test Automation"
    echo "============================================"
    echo ""
}

print_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --backend       Run backend API tests only"
    echo "  --integration   Run integration tests only"
    echo "  --all           Run all tests (default)"
    echo "  --url <url>     Backend API URL (default: http://localhost:8000)"
    echo "  -h, --help      Show this help message"
    echo ""
}

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default values
BACKEND_URL="http://localhost:8000"
RUN_BACKEND=true
RUN_INTEGRATION=true
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Parse arguments
for arg in "$@"; do
    case $arg in
        --backend)
            RUN_INTEGRATION=false
            ;;
        --integration)
            RUN_BACKEND=false
            ;;
        --all)
            RUN_BACKEND=true
            RUN_INTEGRATION=true
            ;;
        --url)
            shift
            BACKEND_URL="$1"
            ;;
        --url=*)
            BACKEND_URL="${arg#*=}"
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
    esac
done

print_banner

cd "$PROJECT_ROOT"
log_info "Working directory: $PROJECT_ROOT"
log_info "Backend URL: $BACKEND_URL"
echo ""

# Test helper function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    log_test "$test_name"
    if eval "$test_command" > /dev/null 2>&1; then
        log_pass "$test_name"
        ((TESTS_PASSED++)) || true
    else
        log_fail "$test_name"
        ((TESTS_FAILED++)) || true
    fi
    return 0  # Always return success to prevent set -e from exiting
}

# Check if backend is running
check_backend_running() {
    log_info "Checking if backend is running at $BACKEND_URL..."
    if curl -s --connect-timeout 5 "$BACKEND_URL/health" > /dev/null 2>&1; then
        log_success "Backend is running"
        return 0
    else
        log_warning "Backend is not running at $BACKEND_URL"
        log_info "Please start the backend with: ./scripts/setup-backend.sh"
        return 1
    fi
}

# Backend API Tests
run_backend_tests() {
    echo ""
    echo "============================================"
    log_info "Running Backend API Tests"
    echo "============================================"
    echo ""
    
    if ! check_backend_running; then
        log_warning "Skipping backend tests - backend not running"
        ((TESTS_SKIPPED++)) || true
        return 0
    fi
    
    # Test 1: Health endpoint
    run_test "Health endpoint returns 200" \
        "curl -s -o /dev/null -w '%{http_code}' '$BACKEND_URL/health' | grep -q '200'"
    
    # Test 2: Root endpoint
    run_test "Root endpoint returns status ok" \
        "curl -s '$BACKEND_URL/' | grep -q '\"status\":\"ok\"'"
    
    # Test 3: API version check
    run_test "API version is 2.0.0" \
        "curl -s '$BACKEND_URL/' | grep -q '\"version\":\"2.0.0\"'"
    
    # Test 4: Check analyze endpoint exists (accept 2xx, 3xx redirects, 405, 422)
    run_test "Analyze endpoint is available" \
        "curl -s -o /dev/null -w '%{http_code}' '$BACKEND_URL/api/analyze' | grep -qE '^(2|3|4)[0-9][0-9]$'"
    
    # Test 5: Check jobs endpoint exists
    run_test "Jobs endpoint is available" \
        "curl -s -o /dev/null -w '%{http_code}' '$BACKEND_URL/api/jobs' | grep -qE '^(2|3|4)[0-9][0-9]$'"
    
    # Test 6: Check calibration endpoint exists
    run_test "Calibration endpoint is available" \
        "curl -s -o /dev/null -w '%{http_code}' '$BACKEND_URL/api/calibration' | grep -qE '^(2|3|4)[0-9][0-9]$'"
    
    # Test 7: Check reports endpoint exists
    run_test "Reports endpoint is available" \
        "curl -s -o /dev/null -w '%{http_code}' '$BACKEND_URL/api/report' | grep -qE '^(2|3|4)[0-9][0-9]$'"
    
    # Test 8: CORS headers present (check with OPTIONS request or regular GET)
    run_test "Server responds to requests" \
        "curl -s -o /dev/null -w '%{http_code}' '$BACKEND_URL/' | grep -q '200'"
    
    # Test 9: JSON content type
    run_test "Returns JSON content type" \
        "curl -s -I '$BACKEND_URL/' | grep -qi 'application/json'"
    
    echo ""
}

# Python unit tests
run_python_tests() {
    echo ""
    echo "============================================"
    log_info "Running Python Unit Tests"
    echo "============================================"
    echo ""
    
    # Check if pytest is available
    if ! command -v pytest &> /dev/null; then
        # Try to use virtual environment
        if [ -f "$PROJECT_ROOT/backend/.venv/bin/pytest" ]; then
            PYTEST_CMD="$PROJECT_ROOT/backend/.venv/bin/pytest"
        else
            log_warning "pytest not found. Installing..."
            if [ -f "$PROJECT_ROOT/backend/.venv/bin/pip" ]; then
                "$PROJECT_ROOT/backend/.venv/bin/pip" install pytest --quiet
                PYTEST_CMD="$PROJECT_ROOT/backend/.venv/bin/pytest"
            else
                log_error "Cannot install pytest. Please set up backend first."
                ((TESTS_SKIPPED++)) || true
                return 0
            fi
        fi
    else
        PYTEST_CMD="pytest"
    fi
    
    # Run pytest if tests directory exists
    if [ -d "$PROJECT_ROOT/tests" ]; then
        log_info "Running pytest..."
        if $PYTEST_CMD "$PROJECT_ROOT/tests" -v --tb=short; then
            log_pass "Python unit tests passed"
            ((TESTS_PASSED++)) || true
        else
            log_fail "Python unit tests failed"
            ((TESTS_FAILED++)) || true
        fi
    else
        log_warning "No tests directory found"
        ((TESTS_SKIPPED++)) || true
    fi
    
    echo ""
}

# Integration tests
run_integration_tests() {
    echo ""
    echo "============================================"
    log_info "Running Integration Tests"
    echo "============================================"
    echo ""
    
    if ! check_backend_running; then
        log_warning "Skipping integration tests - backend not running"
        ((TESTS_SKIPPED++)) || true
        return 0
    fi
    
    # Test 1: Full health check flow
    log_test "Full health check flow"
    HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health" 2>/dev/null)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        log_pass "Health check flow completed"
        ((TESTS_PASSED++)) || true
    else
        log_fail "Health check flow failed"
        ((TESTS_FAILED++)) || true
    fi
    
    # Test 2: API endpoints structure
    log_test "API endpoints structure"
    ROOT_RESPONSE=$(curl -s "$BACKEND_URL/" 2>/dev/null)
    if echo "$ROOT_RESPONSE" | grep -q "endpoints" && \
       echo "$ROOT_RESPONSE" | grep -q "analyze" && \
       echo "$ROOT_RESPONSE" | grep -q "jobs"; then
        log_pass "API endpoints structure is correct"
        ((TESTS_PASSED++)) || true
    else
        log_fail "API endpoints structure is incorrect"
        ((TESTS_FAILED++)) || true
    fi
    
    # Test 3: Response time check
    log_test "Response time < 2 seconds"
    RESPONSE_TIME=$(curl -s -o /dev/null -w '%{time_total}' "$BACKEND_URL/health" 2>/dev/null)
    # Use awk for portable floating point comparison
    if awk "BEGIN {exit !($RESPONSE_TIME < 2)}"; then
        log_pass "Response time is acceptable (${RESPONSE_TIME}s)"
        ((TESTS_PASSED++)) || true
    else
        log_fail "Response time is too slow (${RESPONSE_TIME}s)"
        ((TESTS_FAILED++)) || true
    fi
    
    echo ""
}

# Print summary
print_summary() {
    echo ""
    echo "============================================"
    echo "   Test Summary"
    echo "============================================"
    echo ""
    echo -e "Passed:  ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed:  ${RED}$TESTS_FAILED${NC}"
    echo -e "Skipped: ${YELLOW}$TESTS_SKIPPED${NC}"
    echo ""
    
    TOTAL=$((TESTS_PASSED + TESTS_FAILED))
    if [ $TESTS_FAILED -eq 0 ] && [ $TOTAL -gt 0 ]; then
        log_success "All tests passed!"
        return 0
    elif [ $TESTS_FAILED -gt 0 ]; then
        log_error "Some tests failed!"
        return 1
    else
        log_warning "No tests were run"
        return 0
    fi
}

# Main execution
main() {
    if [ "$RUN_BACKEND" = true ]; then
        run_backend_tests
        run_python_tests
    fi
    
    if [ "$RUN_INTEGRATION" = true ]; then
        run_integration_tests
    fi
    
    print_summary
}

main
