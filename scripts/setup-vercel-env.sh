#!/bin/bash
#
# Vercel Environment Setup Script
#
# This script helps you configure environment variables in Vercel for the frontend.
#
# Prerequisites:
#   - Vercel CLI installed: npm i -g vercel
#   - Vercel project linked: vercel link
#
# Usage:
#   ./scripts/setup-vercel-env.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}☁️  Vercel Environment Setup${NC}"
echo "============================"
echo

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm i -g vercel"
    echo "Documentation: https://vercel.com/docs/cli"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo

# Confirm before proceeding
echo -e "${YELLOW}This will set/update environment variables in Vercel.${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo
echo "📝 Configuration"
echo "================"
echo

# Backend URL
echo -e "${BLUE}Backend Configuration${NC}"
echo "---------------------"
read -p "Railway backend URL (e.g., https://your-app.railway.app): " BACKEND_URL

# Remove trailing slash if present
BACKEND_URL=${BACKEND_URL%/}

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend URL is required${NC}"
    exit 1
fi

# Validate URL format
if [[ ! "$BACKEND_URL" =~ ^https?:// ]]; then
    echo -e "${RED}❌ Invalid URL format. Must start with http:// or https://${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"

# Environment selection
echo
echo -e "${BLUE}Deployment Environment${NC}"
echo "----------------------"
echo "1) preview (for testing)"
echo "2) production"
read -p "Select environment [1]: " ENV_CHOICE
ENV_CHOICE=${ENV_CHOICE:-1}

if [ "$ENV_CHOICE" == "1" ]; then
    VITE_ENVIRONMENT="preview"
    SCOPE="preview"
else
    VITE_ENVIRONMENT="production"
    SCOPE="production"
fi

echo -e "${GREEN}✅ Environment: $VITE_ENVIRONMENT${NC}"

# Set Vercel variables
echo
echo -e "${BLUE}Setting Vercel environment variables...${NC}"
echo "========================================"

# Set for preview deployments
echo -e "${BLUE}Setting preview environment variables...${NC}"
echo "$BACKEND_URL" | vercel env add VITE_API_BASE_URL preview
echo "$VITE_ENVIRONMENT" | vercel env add VITE_ENVIRONMENT preview

if [ "$SCOPE" == "production" ]; then
    echo -e "${BLUE}Setting production environment variables...${NC}"
    echo "$BACKEND_URL" | vercel env add VITE_API_BASE_URL production
    echo "production" | vercel env add VITE_ENVIRONMENT production
fi

echo
echo -e "${GREEN}✅ Vercel environment configured successfully!${NC}"
echo
echo "📝 Environment Variables Set:"
echo "  VITE_API_BASE_URL=$BACKEND_URL"
echo "  VITE_ENVIRONMENT=$VITE_ENVIRONMENT"
echo
echo "📝 Next Steps:"
echo "  1. Deploy frontend: vercel --prod"
echo "  2. Test API connectivity from frontend"
echo "  3. Verify CORS settings in Django backend"
echo
echo "💡 View all variables: vercel env ls"
echo "💡 Pull environment: vercel env pull"
