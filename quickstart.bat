@echo off
REM Quick Start Script for PanelZero Development (Windows)

echo 🚀 PanelZero Quick Start Setup
echo ================================

REM Check prerequisites
echo.
echo ✓ Checking prerequisites...

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3.10+ is required
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 18+ is required
    exit /b 1
)

pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  pnpm not found. Installing globally...
    npm install -g pnpm
    echo ✓ pnpm installed
)

REM Setup Backend
echo.
echo 📦 Setting up backend...
cd backend

if not exist "venv" (
    python -m venv venv
    echo ✓ Virtual environment created
)

call venv\Scripts\activate.bat

pip install -r requirements.txt >nul 2>&1
echo ✓ Backend dependencies installed

if not exist ".env" (
    copy .env.example .env
    echo ⚠️  Created .env file - UPDATE WITH YOUR API KEYS!
    echo    Edit: backend\.env
)

cd ..

REM Setup Frontend with pnpm
echo.
echo 📦 Setting up frontend with pnpm...

pnpm install >nul 2>&1
echo ✓ All dependencies installed (using pnpm)

if not exist "frontend\.env.local" (
    copy frontend\.env.example frontend\.env.local
    echo ⚠️  Created .env.local file - UPDATE WITH YOUR KEYS!
    echo    Edit: frontend\.env.local
)

REM Setup Database
echo.
echo 🗄️  Database setup
echo To create Supabase tables:
echo 1. Go to https://app.supabase.com/
echo 2. Open SQL Editor
echo 3. Copy contents of: backend/database_schema.sql
echo 4. Execute the SQL

REM Summary
echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Update API keys in backend\.env
echo 2. Update keys in frontend\.env.local
echo 3. Run the services:
echo.
echo    Terminal 1 ^(Backend^):
echo    ^> cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo.
echo    Terminal 2 ^(Celery Worker^):
echo    ^> cd backend ^&^& venv\Scripts\activate ^&^& celery -A worker.celery_app worker --loglevel=info
echo.
echo    Terminal 3 ^(Frontend^):
echo    ^> pnpm dev
echo.
echo 🌐 Access:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 📚 Learn more:
echo    See PROJECT_SETUP.md for detailed instructions
echo    See DEVELOPMENT.md for development workflows
echo    See QUICK_REFERENCE.md for common tasks
echo.
echo 💡 Tip: Use 'pnpm' from root for all commands (uses Turbo for caching):
echo    ^> pnpm dev       # Start all services
echo    ^> pnpm build     # Build frontend
echo    ^> pnpm lint      # Lint frontend
