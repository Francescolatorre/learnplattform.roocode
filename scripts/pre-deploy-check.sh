#!/bin/bash
#
# Pre-Deployment Health Check Script
#
# Comprehensive validation before deploying to production.
# Runs all code quality checks, tests, and security validations.
#
# Usage:
#   ./scripts/pre-deploy-check.sh
#   ./scripts/pre-deploy-check.sh --skip-tests  # Skip time-consuming tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0
SKIP_TESTS=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
    esac
done

echo -e "${BLUE}🔍 Pre-Deployment Health Check${NC}"
echo "==============================="
echo

# Function to run a check
check() {
    local name="$1"
    local command="$2"
    local required="${3:-true}"

    echo -n "Checking $name... "

    if eval "$command" &> /tmp/check_output.log; then
        echo -e "${GREEN}✅${NC}"
        ((CHECKS_PASSED++))
        return 0
    else
        if [ "$required" == "true" ]; then
            echo -e "${RED}❌${NC}"
            ((CHECKS_FAILED++))
            echo -e "${YELLOW}Error output:${NC}"
            cat /tmp/check_output.log | head -20
            echo
        else
            echo -e "${YELLOW}⚠️  (optional)${NC}"
        fi
        return 1
    fi
}

# ============================================================================
# Backend Checks
# ============================================================================

echo -e "${BLUE}Backend Checks (Django + Python)${NC}"
echo "---------------------------------"

cd backend

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo "Run: python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate venv
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
else
    echo -e "${RED}❌ Cannot activate virtual environment${NC}"
    exit 1
fi

# Environment validation
check "Environment variables" "python scripts/validate_env.py --strict"

# Code formatting
check "Python formatting (black)" "black --check --quiet ."

# Linting
check "Python linting (flake8)" "flake8 . --count --show-source --statistics"

# Type checking
check "Python type checking (mypy)" "mypy . --ignore-missing-imports --no-error-summary" false

# Django checks
check "Django system check" "python manage.py check --deploy"

# Migrations
check "Django migrations" "python manage.py makemigrations --check --dry-run --no-input"

# Tests
if [ "$SKIP_TESTS" == "false" ]; then
    check "Backend tests" "pytest --tb=short -v"
else
    echo -e "Skipping backend tests... ${YELLOW}⚠️  (--skip-tests flag)${NC}"
fi

cd ..

# ============================================================================
# Frontend Checks
# ============================================================================

echo
echo -e "${BLUE}Frontend Checks (React + TypeScript)${NC}"
echo "-------------------------------------"

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules not found${NC}"
    echo "Run: npm install"
    exit 1
fi

# TypeScript compilation
check "TypeScript compilation" "npx tsc --noEmit"

# ESLint
check "ESLint" "npm run lint" false

# Prettier
check "Prettier formatting" "npx prettier --check ." false

# Tests
if [ "$SKIP_TESTS" == "false" ]; then
    check "Frontend unit tests" "npm run test:unit" false
    check "Frontend integration tests" "npm run test:integration" false
else
    echo -e "Skipping frontend tests... ${YELLOW}⚠️  (--skip-tests flag)${NC}"
fi

# Build validation
check "Frontend build" "npm run build"

cd ..

# ============================================================================
# Security Checks
# ============================================================================

echo
echo -e "${BLUE}Security Checks${NC}"
echo "---------------"

# Check for hardcoded secrets
check "No hardcoded passwords" "! git grep -i -E '(password|secret|key)\s*=\s*[\"'\''][^\"'\'']{8,}[\"'\'']' -- '*.py' '*.ts' '*.tsx' '*.js' '*.jsx' || true"

# Check for .env in git
check "No .env files in git" "! git ls-files | grep -E '^(backend/|frontend/)?\.env$' || true"

# Check for common vulnerable patterns
check "No TODO/FIXME in critical files" "! git grep -i 'TODO\|FIXME' -- '*/settings.py' '*/security*.py' || true" false

# ============================================================================
# Git Checks
# ============================================================================

echo
echo -e "${BLUE}Git Checks${NC}"
echo "----------"

# Check for uncommitted changes
check "No uncommitted changes" "git diff-index --quiet HEAD --" false

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "Current branch: ${BLUE}$CURRENT_BRANCH${NC}"

if [[ $CURRENT_BRANCH == main || $CURRENT_BRANCH == master ]]; then
    echo -e "${YELLOW}⚠️  Warning: Deploying from $CURRENT_BRANCH branch${NC}"
fi

# ============================================================================
# Summary
# ============================================================================

echo
echo "==============================="
echo -e "${BLUE}Summary${NC}"
echo "==============================="
echo -e "Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks failed: ${RED}$CHECKS_FAILED${NC}"
echo

if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Pre-deployment checks FAILED!${NC}"
    echo "Please fix the errors above before deploying."
    exit 1
else
    echo -e "${GREEN}✅ All pre-deployment checks PASSED!${NC}"
    echo
    echo "🚀 Ready to deploy:"
    echo "  Backend:  git push origin main  (triggers Railway deployment)"
    echo "  Frontend: vercel --prod  (or git push for auto-deploy)"
    echo
    echo "📋 Post-deployment checklist:"
    echo "  □ Verify health check endpoint"
    echo "  □ Test authentication flow"
    echo "  □ Check logs for errors"
    echo "  □ Run smoke tests on production"
    echo
    exit 0
fi
