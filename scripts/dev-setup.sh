#!/bin/bash
#
# Development Environment Setup Script
#
# One-command setup for local development environment.
# Sets up both backend (Django) and frontend (React + Vite).
#
# Usage:
#   ./scripts/dev-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛠️  Learning Platform - Development Setup${NC}"
echo "=========================================="
echo

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python not found${NC}"
    echo "Please install Python 3.9+ from https://www.python.org/"
    exit 1
fi

PYTHON_CMD=$(command -v python3 || command -v python)
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    echo "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm found: v$NPM_VERSION${NC}"

echo

# ============================================================================
# Backend Setup
# ============================================================================

echo -e "${BLUE}📦 Setting up backend (Django)...${NC}"
echo "=================================="

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    $PYTHON_CMD -m venv .venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi

# Activate virtual environment (platform-aware)
echo -e "${YELLOW}Activating virtual environment...${NC}"
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
else
    echo -e "${RED}❌ Cannot find virtual environment activation script${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --quiet --upgrade pip
echo -e "${GREEN}✅ pip upgraded${NC}"

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install --quiet -r requirements.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Create .env from template if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from template...${NC}"
    cp .env.example .env

    # Generate a secure SECRET_KEY
    SECRET_KEY=$($PYTHON_CMD -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

    # Update SECRET_KEY in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
    else
        # Linux
        sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
    fi

    echo -e "${GREEN}✅ .env created with secure SECRET_KEY${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env and set ADMIN_PASSWORD${NC}"
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
python manage.py migrate --noinput
echo -e "${GREEN}✅ Database migrations complete${NC}"

# Collect static files (optional for development)
echo -e "${YELLOW}Collecting static files...${NC}"
python manage.py collectstatic --noinput --clear > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Static files collected${NC}"

# Create superuser if ADMIN_PASSWORD is set
if grep -q "ADMIN_PASSWORD=ChangeMe123" .env; then
    echo -e "${YELLOW}⚠️  Skipping admin user creation (update ADMIN_PASSWORD in .env first)${NC}"
else
    echo -e "${YELLOW}Creating admin user...${NC}"
    python create_admin.py || echo -e "${YELLOW}⚠️  Admin user creation skipped (may already exist)${NC}"
fi

cd ..

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo

# ============================================================================
# Frontend Setup
# ============================================================================

echo -e "${BLUE}📦 Setting up frontend (React + Vite)...${NC}"
echo "========================================"

cd frontend

# Install dependencies
echo -e "${YELLOW}Installing Node dependencies (this may take a while)...${NC}"
npm install
echo -e "${GREEN}✅ Node dependencies installed${NC}"

# Create .env for frontend if needed
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating frontend .env...${NC}"
    cat > .env << 'EOF'
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development
EOF
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo -e "${GREEN}✅ Frontend .env already exists${NC}"
fi

cd ..

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo

# ============================================================================
# Summary and Next Steps
# ============================================================================

echo
echo -e "${GREEN}🎉 Development environment ready!${NC}"
echo
echo "=" * 70
echo
echo "📝 Quick Start:"
echo
echo "  Terminal 1 - Start Backend:"
echo -e "    ${BLUE}cd backend${NC}"
echo -e "    ${BLUE}source .venv/bin/activate${NC}  ${YELLOW}# or .venv/Scripts/activate on Windows${NC}"
echo -e "    ${BLUE}python manage.py runserver${NC}"
echo
echo "  Terminal 2 - Start Frontend:"
echo -e "    ${BLUE}cd frontend${NC}"
echo -e "    ${BLUE}npm run dev${NC}"
echo
echo "  Access the application:"
echo -e "    Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "    Backend API: ${BLUE}http://localhost:8000${NC}"
echo -e "    Django Admin: ${BLUE}http://localhost:8000/admin/${NC}"
echo
echo "📚 Common Commands:"
echo -e "    Run tests: ${BLUE}cd backend && pytest${NC} or ${BLUE}cd frontend && npm test${NC}"
echo -e "    Format code: ${BLUE}cd backend && black .${NC} or ${BLUE}cd frontend && npm run format${NC}"
echo -e "    Validate env: ${BLUE}cd backend && python scripts/validate_env.py${NC}"
echo
echo "💡 Tips:"
echo "  - Edit backend/.env to set ADMIN_PASSWORD, then run: python create_admin.py"
echo "  - Check backend/.env.example for all available configuration options"
echo "  - Run './scripts/dev-setup.sh' again anytime to update dependencies"
echo
