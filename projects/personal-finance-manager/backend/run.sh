#!/bin/bash

# Personal Finance Manager Backend - Run Script
# Makes it easy to start the development server

echo "🚀 Starting Personal Finance Manager Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "📝 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and set your SECRET_KEY!"
    echo ""
fi

# Check if database exists
if [ ! -f "finance_manager.db" ]; then
    echo "🗄️  Database not found!"
    echo "📝 Would you like to seed the database? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        python seed_data.py
    else
        echo "⚠️  Database will be created on first run (empty)"
    fi
    echo ""
fi

# Start the server
echo "🎉 Starting FastAPI server..."
echo "📍 API: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/api/v1/docs"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

python main.py
