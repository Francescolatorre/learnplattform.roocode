# MVP Requirement: Simple Development Hosting Environment Setup

**ID:** REQ-078-MVP
**Original Requirement:** REQ-078 (simplified to MVP scope)

## Requirement Analysis

**Type:** Infrastructure & DevOps (MVP)
**Priority:** P1 (High) - Core development workflow enablement
**Complexity:** 4 Story Points - Simplified single-environment setup
**Timeline:** 2 weeks maximum (1 week target)
**Budget:** $5-24/month total cost

**Architecture Impact:**
- Frontend hosting on Vercel (Free/Hobby)
- Backend hosting on Railway ($5 Hobby Plan)
- Database hosting on Neon PostgreSQL (Free → Paid $0-19)
- Basic CI/CD with GitHub Actions
- Single development environment initially

## User Story

**As a** development team member
**I want to** have a simple, working development hosting environment
**So that** we can deploy features quickly, test integrations, and demonstrate progress without complex infrastructure overhead

## MVP Acceptance Criteria

### Phase 1: Core Setup (Week 1)

#### Neon PostgreSQL - Free Tier
- [ ] Neon account setup with free tier database
- [ ] Database connection string generated
- [ ] Basic database connectivity tested

#### Railway Django Backend
- [ ] Railway account connected to GitHub repository
- [ ] Auto-deployment configured from `development` branch only
- [ ] Django + DRF deployed with auto-detection
- [ ] Health check endpoint at `/health/`
- [ ] Django Admin accessible at custom URL `/admin-xyz/`

#### Vercel React Frontend
- [ ] Vercel project connected to existing account
- [ ] Auto-deployment from `development` branch
- [ ] PR preview deployments enabled
- [ ] Basic environment variables set via Vercel UI

#### Environment Variables - Platform UIs
- [ ] Railway environment variables set via dashboard
- [ ] Vercel environment variables set via dashboard
- [ ] Database URL properly configured
- [ ] CORS origins configured for frontend ↔ backend

### Phase 2: Basic CI/CD (Week 2)

#### GitHub Actions - Basic Pipeline
- [ ] Django tests run before Railway deployment
- [ ] Frontend build tests before Vercel deployment
- [ ] Simple deployment trigger on `development` branch push

#### CORS & Integration
- [ ] CORS properly configured between React and Django
- [ ] API endpoints accessible from frontend
- [ ] Authentication flow working across environments

## Implementation Tasks (MVP)

### Day 1-2: Database + Backend Foundation
- **Neon PostgreSQL Setup** (2 hours)
  - Create free tier account
  - Generate database and connection string
  - Test connection locally

- **Railway Django Deployment** (4 hours)
  - Connect GitHub repository to Railway
  - Configure Django settings for Railway
  - Test auto-deployment from development branch
  - Create Django superuser for admin access

### Day 3-4: Frontend + Integration (Monorepo Strategy)
- **Vercel Frontend Setup - 4-Step Approach** (6 hours total)

#### Step 1: Local Frontend Build Testing (1.5 hours)
```bash
# Test build process in monorepo context
cd frontend
npm install
npm run build
# Verify dist/ output and asset paths
# Check TypeScript compilation
# Validate Vite aliases (@components, @services)
```

#### Step 2: Separate Vercel Project for Frontend (2 hours)
```json
// Vercel Project Settings (CHOSEN APPROACH)
{
  "name": "learnplatform-frontend",
  "rootDirectory": "frontend",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```
- **Option 1:** Separate Vercel Project dedicated to frontend only
- Clean separation of concerns (frontend independent of backend)
- Set Root Directory to `frontend` (critical for monorepo)
- Enable PR preview deployments
- Standard Vite Build with Vercel auto-detection

#### Step 3: Hardcoded Development URLs (1.5 hours)
```typescript
// Environment Variables Strategy (CHOSEN APPROACH)
// Development (local)
VITE_API_BASE_URL=http://localhost:8000/api/v1

// Vercel Preview (hardcoded, will be replaced)
VITE_API_BASE_URL=http://localhost:8000/api/v1

// Production (Railway - to be updated later)
VITE_API_BASE_URL=https://your-railway-app.railway.app/api/v1
```
- **Option 1 Approach:** Hardcoded development URLs initially
- Simple configuration for immediate deployment
- API calls will fail gracefully until Railway backend ready
- Easy replacement once Railway provides actual URL

#### Step 4: Railway Integration (1 hour)
- Update API URLs once Railway backend is deployed
- Test cross-origin requests
- Verify authentication flow

### Day 5: CI/CD + Testing
- **GitHub Actions Basic Setup** (3 hours)
  - Create workflow for Django tests
  - Configure Railway deployment trigger
  - Test full deployment pipeline

- **End-to-End Validation** (2 hours)
  - Test complete user flow across deployed environments
  - Verify Django Admin access
  - Document access URLs and credentials

## Monorepo-Specific Implementation Details

### Vercel Monorepo Challenges & Solutions

#### Challenge 1: Build Context
**Problem:** Vercel runs in project root, but frontend needs `frontend/` context
**Solution:** Set `rootDirectory: "frontend"` in Vercel project settings

#### Challenge 2: Path Resolution
**Problem:** Vite aliases and TypeScript paths may break in deployment
**Solution:** Verify `vite.config.ts` paths work in production build

#### Challenge 3: Environment Variables
**Problem:** API URLs unknown during frontend development
**Solution:** Phased deployment with mock URLs, then Railway integration

### Technical Configuration for Monorepo

#### Vercel.json Configuration (Standard Vite Build)
```json
{
  "name": "learnplatform-frontend",
  "version": 2,
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```
**Chosen Strategy:** Standard Vite Build with Vercel auto-detection
- Minimal configuration overhead
- Leverages Vercel's built-in Vite support
- Automatic optimization and caching

#### Environment Variables Management
```typescript
// frontend/.env.example
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
VITE_ADMIN_URL=http://localhost:8000/admin/

// Vercel Environment Variables (set via dashboard)
VITE_API_BASE_URL=https://your-railway-app.railway.app/api/v1
VITE_ENVIRONMENT=preview
VITE_ADMIN_URL=https://your-railway-app.railway.app/admin-preprod/
```

### Build Validation Checklist

#### Pre-Deployment Validation
- [ ] `cd frontend && npm run build` succeeds
- [ ] `dist/` directory contains index.html and assets
- [ ] No TypeScript compilation errors
- [ ] Vite aliases resolve correctly
- [ ] Environment variables properly injected

#### Post-Deployment Validation
- [ ] Vercel URL loads React application
- [ ] React Router navigation works (SPA routing)
- [ ] Asset loading successful (CSS, JS, images)
- [ ] API calls fail gracefully (until backend ready)
- [ ] Browser dev tools show no critical errors

### Deployment Pipeline Integration

#### Branch Strategy
```
feature/REQ-078-hosting-environment-setup
├── Push triggers Vercel preview deployment
├── Railway deployment (blocked - pipeline fixes needed)
└── Integration testing once both deployed
```

#### Success Metrics
- [ ] Frontend deploys independently of backend
- [ ] Vercel preview URLs work for PR reviews
- [ ] Mock API configuration validates frontend functionality
- [ ] Easy transition to Railway backend when ready

## Technical Configuration

### Django Settings for Railway
```python
# settings.py additions for Railway
import dj_database_url
import os

# Database configuration
DATABASES = {
    'default': dj_database_url.parse(
        os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Railway-specific settings
ALLOWED_HOSTS = ['.railway.app', 'localhost', '127.0.0.1']
if 'RAILWAY_ENVIRONMENT' in os.environ:
    ALLOWED_HOSTS.append(os.environ.get('RAILWAY_STATIC_URL', '').replace('https://', ''))

# Custom admin URL for security
ADMIN_URL = os.environ.get('DJANGO_ADMIN_URL', 'admin-xyz/')

# CORS for frontend
CORS_ALLOWED_ORIGINS = [
    os.environ.get('FRONTEND_URL', 'http://localhost:5173'),
]

# Static files with Whitenoise
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Vite Environment Variables
```typescript
// .env for different environments
VITE_API_BASE_URL=https://yourapp.railway.app/api
VITE_ENVIRONMENT=development
VITE_ADMIN_URL=https://yourapp.railway.app/admin-xyz/
```

### Basic GitHub Actions
```yaml
# .github/workflows/deploy-development.yml
name: Deploy to Development
on:
  push:
    branches: [development]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Django Tests
        run: |
          cd backend
          python -m pytest
      - name: Railway Deploy
        run: echo "Railway auto-deploys on push"
```

## Cost Structure (MVP)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Neon PostgreSQL** | Free Tier | $0 |
| **Railway** | Hobby Plan | $5 |
| **Vercel** | Hobby Plan | $0 |
| **GitHub Actions** | Free Tier | $0 |
| **Total** | | **$5/month** |

**Upgrade Triggers:**
- Database usage >1GB → Neon Launch ($19/month)
- High traffic → Vercel Pro ($20/month)
- Multiple environments → Additional Railway services

## Success Criteria (MVP)

### Functional Success
- [ ] Development environment accessible within 24 hours
- [ ] Git push to `development` branch triggers automatic deployment
- [ ] Frontend communicates successfully with backend APIs
- [ ] Django Admin accessible for content management
- [ ] Database persists data across deployments

### Performance Success
- [ ] Frontend loads in <3 seconds
- [ ] API responses in <2 seconds
- [ ] Deployment time <5 minutes total

### Developer Experience Success
- [ ] Zero-config deployment (just git push)
- [ ] Clear error messages in deployment logs
- [ ] Easy access to Django Admin for debugging
- [ ] Preview deployments work for PRs

## What We're NOT Doing (MVP Scope)

❌ **Multiple Environments**: Only development environment initially
❌ **Advanced Security**: Basic HTTPS, no penetration testing
❌ **Performance Monitoring**: Beyond basic health checks
❌ **Disaster Recovery**: No backup/restore procedures
❌ **Auto-scaling**: Fixed resource allocation
❌ **Advanced CI/CD**: No staging promotions or rollbacks

## Quick Wins Expected

✅ **Immediate Benefits:**
- Git push → Live deployment in 5 minutes
- PR previews for frontend changes
- Django Admin for content management
- Neon's branching for database experiments
- Railway's built-in monitoring dashboards

## Upgrade Path (Future Considerations)

**When to Add Complexity:**
- **500+ Users**: Add staging environment
- **Team >3 People**: Add production environment with approval gates
- **Revenue >$1k/month**: Add advanced monitoring and security
- **Series A Funding**: Enterprise security and compliance features

## Implementation Priority

**Week 1 Target:**
1. **Day 1**: Neon + Railway setup
2. **Day 2**: Django deployment working
3. **Day 3**: Vercel frontend deployment
4. **Day 4**: API integration working
5. **Day 5**: Basic CI/CD and testing

**Ready to Ship:** End of Week 1 maximum

This MVP provides a solid, cost-effective foundation that can scale as the project grows.