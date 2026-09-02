#!/usr/bin/env bash
set -o errexit

echo "Starting build process for Kaveri Stays..."

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Build frontend if Node/npm is present
if command -v npm &> /dev/null; then
  echo "Building frontend bundle with Vite..."
  cd frontend
  npm install
  npm run build
  cd ..
  mkdir -p backend/dist backend/api/dist
  cp -r frontend/dist/* backend/dist/ || true
  cp -r frontend/dist/* backend/api/dist/ || true
  echo "Frontend assets synchronized to backend/dist"
fi

echo "Build complete."
