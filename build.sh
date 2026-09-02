#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
if command -v npm &> /dev/null; then
  cd frontend
  npm install
  npm run build
  cd ..
  cp -r frontend/dist backend/dist || true
fi
