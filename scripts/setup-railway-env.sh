#!/bin/bash
#
# Railway Environment Setup Script
#
# This script helps you configure environment variables in Railway interactively.
# It generates secure secrets and prompts for necessary credentials.
#
# Prerequisites:
#   - Railway CLI installed: npm i -g @railway/cli
#   - Railway project linked: railway link
#
# Usage:
#   ./scripts/setup-railway-env.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚂 Railway Environment Setup${NC}"
echo "=============================="
echo

# Check if railway CLI is available
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install with: npm i -g @railway/cli"
    echo "Documentation: https://docs.railway.app/develop/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"
echo

# Check if project is linked
if ! railway status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not linked to a Railway project${NC}"
    echo "Link to your project with: railway link"
    exit 1
fi

echo -e "${GREEN}✅ Project linked${NC}"
echo

# Confirm before proceeding
echo -e "${YELLOW}This will set/update environment variables in Railway.${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo
echo "📝 Configuration"
echo "================"

# Generate secure SECRET_KEY
echo -e "${BLUE}Generating secure Django SECRET_KEY...${NC}"
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || \
             python -c "import secrets; print(secrets.token_urlsafe(50))")

if [ -z "$SECRET_KEY" ]; then
    echo -e "${RED}❌ Failed to generate SECRET_KEY${NC}"
    echo "Please ensure Python is installed"
    exit 1
fi

echo -e "${GREEN}✅ SECRET_KEY generated (${#SECRET_KEY} chars)${NC}"

# Admin credentials
echo
echo -e "${BLUE}Admin User Configuration${NC}"
echo "------------------------"

read -p "Admin username [admin]: " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

read -p "Admin email [admin@learnplatform.dev]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@learnplatform.dev}

# Password with validation
while true; do
    read -s -p "Admin password (min 12 chars): " ADMIN_PASSWORD
    echo

    if [ ${#ADMIN_PASSWORD} -lt 12 ]; then
        echo -e "${RED}❌ Password too short. Minimum 12 characters required.${NC}"
        continue
    fi

    # Check for common weak passwords
    if [[ "$ADMIN_PASSWORD" =~ ^(admin|password|12345|qwerty) ]]; then
        echo -e "${RED}❌ Password too weak. Avoid common passwords.${NC}"
        continue
    fi

    read -s -p "Confirm password: " ADMIN_PASSWORD_CONFIRM
    echo

    if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
        echo -e "${RED}❌ Passwords don't match. Try again.${NC}"
        continue
    fi

    break
done

echo -e "${GREEN}✅ Admin credentials configured${NC}"

# Environment selection
echo
echo -e "${BLUE}Deployment Environment${NC}"
echo "----------------------"
echo "1) preproduction"
echo "2) production"
read -p "Select environment [1]: " ENV_CHOICE
ENV_CHOICE=${ENV_CHOICE:-1}

if [ "$ENV_CHOICE" == "1" ]; then
    RAILWAY_ENVIRONMENT="preproduction"
    DEBUG="False"
    DJANGO_ADMIN_URL="admin-preprod/"
else
    RAILWAY_ENVIRONMENT="production"
    DEBUG="False"
    DJANGO_ADMIN_URL="admin-secure-$(openssl rand -hex 4)/"
fi

echo -e "${GREEN}✅ Environment: $RAILWAY_ENVIRONMENT${NC}"
echo -e "${GREEN}✅ Admin URL: /$DJANGO_ADMIN_URL${NC}"

# Set Railway variables
echo
echo -e "${BLUE}Setting Railway environment variables...${NC}"
echo "=========================================="

railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DEBUG="$DEBUG"
railway variables set ADMIN_USERNAME="$ADMIN_USERNAME"
railway variables set ADMIN_EMAIL="$ADMIN_EMAIL"
railway variables set ADMIN_PASSWORD="$ADMIN_PASSWORD"
railway variables set DJANGO_ADMIN_URL="$DJANGO_ADMIN_URL"
railway variables set RAILWAY_ENVIRONMENT="$RAILWAY_ENVIRONMENT"

echo
echo -e "${GREEN}✅ Railway environment configured successfully!${NC}"
echo
echo "🔒 Security Notes:"
echo "  - Credentials are stored securely in Railway"
echo "  - Never commit secrets to version control"
echo "  - Admin URL has been customized: /$DJANGO_ADMIN_URL"
echo
echo "📝 Next Steps:"
echo "  1. Set DATABASE_URL in Railway dashboard (from Neon)"
echo "  2. Deploy: git push origin main"
echo "  3. Create admin user: railway run python create_admin.py"
echo "  4. Access admin at: https://your-app.railway.app/$DJANGO_ADMIN_URL"
echo
echo "💡 View all variables: railway variables"
echo "💡 Check deployment logs: railway logs"
