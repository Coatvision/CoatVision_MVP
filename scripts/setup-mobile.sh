#!/bin/bash

# CoatVision Mobile App Setup Script
# This script sets up the mobile development environment (React Native/Expo)

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
MOBILE_DIR="$PROJECT_ROOT/mobile"

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

# Check if Expo CLI is installed
check_expo() {
    log_info "Checking Expo CLI..."
    
    if command -v expo &> /dev/null; then
        EXPO_VERSION=$(expo --version 2>/dev/null || echo "unknown")
        log_success "Expo CLI found: $EXPO_VERSION"
    else
        log_warning "Expo CLI not found globally. Installing..."
        npm install -g expo-cli
        log_success "Expo CLI installed"
    fi
}

# Check mobile directory exists
check_mobile_directory() {
    log_info "Checking mobile directory..."
    
    if [ ! -d "$MOBILE_DIR" ]; then
        log_error "Mobile directory not found at: $MOBILE_DIR"
        exit 1
    fi
    
    log_success "Mobile directory found"
}

# Install dependencies
install_dependencies() {
    log_info "Installing mobile app dependencies..."
    
    cd "$MOBILE_DIR"
    
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
    log_info "Verifying mobile app configuration..."
    
    cd "$MOBILE_DIR"
    
    # Check for required files
    REQUIRED_FILES=(
        "package.json"
        "src/App.jsx"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_success "Found: $file"
        else
            # Try alternative paths
            ALT_FILE=$(echo "$file" | sed 's/jsx/js/')
            if [ -f "$ALT_FILE" ]; then
                log_success "Found: $ALT_FILE"
            else
                log_warning "Missing: $file"
            fi
        fi
    done
    
    # Check for app.json (Expo config)
    if [ -f "app.json" ]; then
        log_success "Found: app.json (Expo configuration)"
    else
        log_warning "Missing: app.json (Expo configuration)"
    fi
    
    # Verify package.json has required scripts
    if [ -f "package.json" ]; then
        if grep -q '"start"' package.json; then
            log_success "Start script found in package.json"
        else
            log_warning "Start script not found in package.json"
        fi
    fi
}

# Check for required platform tools
check_platform_tools() {
    log_info "Checking platform development tools..."
    
    # Check for Android SDK
    if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
        log_success "Android SDK found at: $ANDROID_HOME"
    elif [ -n "$ANDROID_SDK_ROOT" ] && [ -d "$ANDROID_SDK_ROOT" ]; then
        log_success "Android SDK found at: $ANDROID_SDK_ROOT"
    else
        log_warning "Android SDK not found. Android development may not work."
        log_info "Set ANDROID_HOME or ANDROID_SDK_ROOT environment variable."
    fi
    
    # Check for Xcode (macOS only)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v xcodebuild &> /dev/null; then
            XCODE_VERSION=$(xcodebuild -version 2>/dev/null | head -n1)
            log_success "Xcode found: $XCODE_VERSION"
        else
            log_warning "Xcode not found. iOS development may not work."
        fi
    fi
    
    # Check for Watchman (recommended for React Native)
    if command -v watchman &> /dev/null; then
        WATCHMAN_VERSION=$(watchman --version 2>/dev/null)
        log_success "Watchman found: $WATCHMAN_VERSION"
    else
        log_warning "Watchman not found. Installing is recommended for better performance."
        log_info "Install with: brew install watchman (macOS) or see https://facebook.github.io/watchman/"
    fi
}

# Start the mobile app in development mode
start_app() {
    log_info "Starting mobile app in development mode..."
    
    cd "$MOBILE_DIR"
    
    log_info "Mobile app starting..."
    log_info "Press 'a' for Android, 'i' for iOS, or 'w' for web"
    log_info "Press Ctrl+C to stop"
    
    npm start
}

# Start with specific platform
start_android() {
    log_info "Starting mobile app for Android..."
    
    cd "$MOBILE_DIR"
    
    npm run android
}

start_ios() {
    log_info "Starting mobile app for iOS..."
    
    cd "$MOBILE_DIR"
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "iOS development is only available on macOS"
        exit 1
    fi
    
    npm run ios
}

start_web() {
    log_info "Starting mobile app for Web..."
    
    cd "$MOBILE_DIR"
    
    npm run web
}

# Run linting
run_lint() {
    log_info "Running linter..."
    
    cd "$MOBILE_DIR"
    
    if grep -q '"lint"' package.json; then
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
    echo "CoatVision Mobile App Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup       Full setup: check dependencies, install packages"
    echo "  install     Install/update dependencies only"
    echo "  verify      Verify configuration and dependencies"
    echo "  start       Start the mobile app (development mode)"
    echo "  android     Start for Android"
    echo "  ios         Start for iOS (macOS only)"
    echo "  web         Start for Web"
    echo "  lint        Run linter"
    echo "  help        Show this help message"
    echo ""
    echo "If no command is provided, 'setup' will be executed."
}

# Main function
main() {
    echo "=========================================="
    echo "CoatVision Mobile App Setup Script"
    echo "=========================================="
    echo ""
    
    COMMAND=${1:-setup}
    
    case $COMMAND in
        setup)
            check_node
            check_npm
            check_mobile_directory
            check_expo
            install_dependencies
            verify_config
            check_platform_tools
            log_success "Mobile app setup complete!"
            echo ""
            log_info "To start the app, run: $0 start"
            log_info "For Android: $0 android"
            log_info "For iOS (macOS only): $0 ios"
            log_info "For Web: $0 web"
            ;;
        install)
            check_node
            check_npm
            check_mobile_directory
            install_dependencies
            ;;
        verify)
            check_node
            check_npm
            check_mobile_directory
            verify_config
            check_platform_tools
            ;;
        start)
            start_app
            ;;
        android)
            start_android
            ;;
        ios)
            start_ios
            ;;
        web)
            start_web
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
