#!/usr/bin/env bash
# Backend build script for Render deployment

set -e  # Exit on error

echo "===== CoatVision Backend Build Script ====="
echo "Python version:"
python --version

echo ""
echo "===== Installing Python dependencies ====="
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "===== Creating necessary directories ====="
mkdir -p uploads outputs

echo ""
echo "===== Build completed successfully ====="
