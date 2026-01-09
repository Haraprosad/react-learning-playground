@echo off
REM Personal Finance Manager Backend - Run Script (Windows)
REM Makes it easy to start the development server

echo 🚀 Starting Personal Finance Manager Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo ❌ Virtual environment not found!
    echo 📝 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo 📦 Installing dependencies...
    pip install -r requirements.txt
    echo ✅ Dependencies installed
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo 📝 Creating from .env.example...
    copy .env.example .env
    echo ✅ .env file created
    echo ⚠️  Please edit .env and set your SECRET_KEY!
    echo.
)

REM Check if database exists
if not exist "finance_manager.db" (
    echo 🗄️  Database not found!
    echo 📝 Would you like to seed the database? (y/n)
    set /p response=
    if /i "%response%"=="y" (
        python seed_data.py
    ) else (
        echo ⚠️  Database will be created on first run (empty)
    )
    echo.
)

REM Start the server
echo 🎉 Starting FastAPI server...
echo 📍 API: http://localhost:8000
echo 📚 Docs: http://localhost:8000/api/v1/docs
echo.
echo Press CTRL+C to stop the server
echo.

python main.py
