#!/usr/bin/env bash
set -e

echo "======================================================"
echo "   ⚡ CodeWaste Detector — AI & AST Optimization Platform"
echo "======================================================"

# Check Python environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Ensure frontend build is present for unified server
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend assets..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

echo "Starting CodeWaste Detector on http://127.0.0.1:8000 ..."
echo "API Docs available at http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to stop."

uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
