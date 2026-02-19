#!/bin/bash
# Quick Start Script for PanelZero Development

set -e

echo "🚀 PanelZero Quick Start Setup"
echo "================================"

# Check prerequisites
echo "\n✓ Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.10+ is required"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ is required"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing globally..."
    npm install -g pnpm
    echo "✓ pnpm installed"
fi

if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis not found. Install with:"
    echo "   macOS: brew install redis"
    echo "   Linux: apt-get install redis-server"
    echo "   Windows: https://github.com/microsoftarchive/redis/releases"
    echo "\nYou can also use Docker: docker run -d -p 6379:6379 redis:7"
fi

# Setup Backend
echo "\n📦 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

pip install -r requirements.txt -q
echo "✓ Backend dependencies installed"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env file - UPDATE WITH YOUR API KEYS!"
    echo "   Edit: backend/.env"
fi

cd ..

# Setup Frontend with pnpm
echo "\n📦 Setting up frontend with pnpm..."

pnpm install -q
echo "✓ All dependencies installed (using pnpm)"

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "⚠️  Created .env.local file - UPDATE WITH YOUR KEYS!"
    echo "   Edit: frontend/.env.local"
fi

# Setup Database
echo "\n🗄️  Database setup"
echo "To create Supabase tables:"
echo "1. Go to https://app.supabase.com/"
echo "2. Open SQL Editor"
echo "3. Copy contents of: backend/database_schema.sql"
echo "4. Execute the SQL"

# Summary
echo "\n✅ Setup complete!"
echo "\n📝 Next steps:"
echo "1. Update API keys in backend/.env"
echo "2. Update keys in frontend/.env.local"
echo "3. Run the services:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend && source venv/bin/activate && python main.py"
echo ""
echo "   Terminal 2 (Celery Worker):"
echo "   $ cd backend && source venv/bin/activate && celery -A worker.celery_app worker --loglevel=info"
echo ""
echo "   Terminal 3 (Frontend):"
echo "   $ pnpm dev"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📚 Learn more:"
echo "   See PROJECT_SETUP.md for detailed instructions"
echo "   See DEVELOPMENT.md for development workflows"
echo "   See QUICK_REFERENCE.md for common tasks"
echo ""
echo "💡 Tip: Use 'pnpm' from root for all commands (uses Turbo for caching):"
echo "   $ pnpm dev       # Start all services"
echo "   $ pnpm build     # Build frontend"
echo "   $ pnpm lint      # Lint frontend"
