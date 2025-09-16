# Cloud Test Environment Guide

## Overview

This guide covers the setup, usage, and maintenance of cloud test environments using Vercel (frontend deployment) and Neon (PostgreSQL database) integrated with our existing GitHub Actions CI/CD pipeline.

## Architecture

```
GitHub Repository
├── Feature Branch (feature/TASK-XXX-description)
├── Pull Request → Triggers Preview Environment
│   ├── Neon Database Branch (pr-123)
│   └── Vercel Preview Deployment
└── Main Branch → Production Deployment
    ├── Neon Main Database
    └── Vercel Production Deployment
```

## Quick Start

### 1. Prerequisites

Install required CLI tools:
```bash
# Install Vercel CLI
npm install -g vercel@latest

# Install Neon CLI
npm install -g neonctl

# Verify installations
vercel --version
neonctl --version
```

### 2. Environment Setup

1. **Set up Neon Database:**
   ```bash
   # Authenticate with Neon
   neonctl auth

   # Create project (or use existing)
   neonctl projects create --name learning-platform
   ```

2. **Set up Vercel Project:**
   ```bash
   # Link project to Vercel
   vercel link

   # Set up environment variables
   vercel env add DATABASE_URL
   vercel env add SECRET_KEY
   vercel env add DEBUG
   ```

3. **Configure GitHub Secrets:**
   Go to Repository Settings → Secrets and variables → Actions:
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_PROJECT_ID=your_project_id
   VERCEL_ORG_ID=your_org_id
   NEON_API_KEY=your_neon_api_key
   NEON_PROJECT_ID=your_neon_project_id
   ```

## Development Workflow

### Feature Development with Preview Environments

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/TASK-123-new-feature
   ```

2. **Push Changes:**
   ```bash
   git push origin feature/TASK-123-new-feature
   ```

3. **Create Pull Request:**
   - GitHub Actions automatically creates:
     - Neon database branch: `pr-123`
     - Vercel preview deployment
     - Runs migrations and seeds test data

4. **Test Preview Environment:**
   - Preview URL posted as PR comment
   - Includes test credentials
   - Run validation tests

5. **Merge to Main:**
   - Triggers production deployment
   - Cleanup of preview resources

### Manual Environment Management

#### Create Database Branch
```bash
python scripts/setup_neon_branch.py --branch-name feature-xyz --env-file
```

#### Deploy Preview Manually
```bash
vercel deploy --env DATABASE_URL="postgres://..." --env DEBUG="true"
```

#### Validate Environment
```bash
python scripts/validate_cloud_environment.py --environment staging --comprehensive
```

## Environment Configuration

### Environment Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | Local PostgreSQL | Neon Branch | Neon Main |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Preview URL | Production URL |
| `DEBUG` | `true` | `true` | `false` |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | `*.vercel.app` | `your-domain.com,*.vercel.app` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | `https://*.vercel.app` | `https://your-domain.com` |

### Database Branching Strategy

```
main (production)
├── staging (staging environment)
└── pr-{number} (pull request previews)
    ├── pr-123 (feature A)
    ├── pr-124 (feature B)
    └── pr-125 (feature C)
```

## Testing Strategy

### Automated Testing Pipeline

1. **Unit Tests** (Local & CI)
   - Frontend: Vitest
   - Backend: pytest
   - Run on every commit

2. **Integration Tests** (Local & CI)
   - API integration tests
   - Service layer tests
   - Run on every PR

3. **E2E Tests** (Local & Preview)
   - Playwright tests
   - Run against preview environments
   - Smoke tests on production

4. **Preview Environment Tests**
   - Health checks
   - Functional tests
   - Performance benchmarks

### Test Environment Types

| Environment | Purpose | Database | URL | Triggers |
|-------------|---------|----------|-----|----------|
| **Local** | Development | Local PostgreSQL | `localhost:3000` | Manual |
| **Preview** | PR Testing | Neon Branch | `*.vercel.app` | PR Creation |
| **Staging** | Pre-production | Neon Staging | `staging.vercel.app` | Main Branch |
| **Production** | Live Environment | Neon Main | `your-domain.com` | Release Tags |

## Monitoring and Observability

### Health Checks

All environments expose health endpoints:
- `GET /health` - Basic health check
- `GET /health/database` - Database connectivity
- `GET /health/detailed` - Comprehensive status

### Performance Monitoring

- **Vercel Analytics** - Page load times, Core Web Vitals
- **Neon Metrics** - Database performance, query analytics
- **Custom Metrics** - Application-specific monitoring

### Alerting

Set up alerts for:
- Deployment failures
- Health check failures
- Performance degradation
- Database connection issues

## Troubleshooting

### Common Issues

#### 1. Preview Environment Not Creating
```bash
# Check GitHub Actions logs
# Verify secrets are set
# Test Neon CLI authentication
neonctl projects list

# Test Vercel CLI authentication
vercel whoami
```

#### 2. Database Connection Errors
```bash
# Verify database branch exists
neonctl branches list --project-id YOUR_PROJECT_ID

# Test connection string
psql "postgres://user:pass@host/db" -c "SELECT 1;"
```

#### 3. Build Failures
```bash
# Check Vercel build logs
vercel logs YOUR_DEPLOYMENT_URL

# Test build locally
cd frontend && npm run build
```

#### 4. Environment Variables Not Set
```bash
# List Vercel environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME
```

### Rollback Procedures

#### Preview Environment Rollback
1. **Automatic Cleanup:**
   - Closes PR automatically cleans up resources
   - Manual cleanup: Run cleanup-preview.yml workflow

2. **Manual Cleanup:**
   ```bash
   # Delete Neon branch
   neonctl branches delete pr-123 --project-id YOUR_PROJECT_ID

   # Vercel previews auto-expire
   ```

#### Production Rollback
1. **Vercel Rollback:**
   ```bash
   # List deployments
   vercel ls

   # Promote previous deployment
   vercel promote PREVIOUS_DEPLOYMENT_URL
   ```

2. **Database Rollback:**
   ```bash
   # Restore from backup (if needed)
   # Neon provides point-in-time recovery
   ```

### Emergency Procedures

#### Complete Environment Failure
1. **Switch to Local Development:**
   ```bash
   cp .env.template .env.local
   # Update with local database URL
   npm run dev
   ```

2. **Redeploy from Backup:**
   ```bash
   python scripts/migrate_to_cloud.py --rollback
   ```

## Team Training Requirements

### Required Skills
- **Git Workflow:** Feature branches, pull requests
- **CLI Tools:** Basic Vercel and Neon CLI commands
- **Environment Variables:** Understanding of configuration management
- **Debugging:** Reading logs, troubleshooting deployments

### Training Checklist
- [ ] Complete cloud environment setup
- [ ] Create and test preview environment
- [ ] Run validation scripts
- [ ] Practice rollback procedures
- [ ] Review monitoring dashboards

### Support Resources
- **Documentation:** This guide + vendor docs
- **Team Channels:** #cloud-environments Slack channel
- **Office Hours:** Weekly cloud environment Q&A
- **Escalation:** DevOps team contact info

## Cost Management

### Neon Costs
- **Free Tier:** 3 branches, 3GB storage
- **Pro Tier:** $19/month, unlimited branches
- **Monitor:** Database usage, connection pooling

### Vercel Costs
- **Free Tier:** 100GB bandwidth, unlimited previews
- **Pro Tier:** $20/month per member
- **Monitor:** Bandwidth usage, function executions

### Optimization Tips
- Clean up old preview environments
- Use database connection pooling
- Optimize build times
- Monitor resource usage

## Security Considerations

### Access Control
- **GitHub:** Branch protection rules
- **Vercel:** Team permissions
- **Neon:** Database user roles

### Environment Isolation
- Separate databases per environment
- Environment-specific secrets
- Network isolation (where applicable)

### Data Protection
- No production data in previews
- Automated test data seeding
- Regular security updates

## Maintenance Schedule

### Daily
- Monitor deployment health
- Check alert notifications
- Review failed deployments

### Weekly
- Clean up old preview environments
- Review resource usage
- Update dependencies

### Monthly
- Performance optimization review
- Cost analysis
- Security updates
- Team training updates

---

## Quick Reference

### Commands
```bash
# Setup new branch
python scripts/setup_neon_branch.py --branch-name feature-xyz

# Validate environment
python scripts/validate_cloud_environment.py --environment staging

# Deploy preview
vercel deploy

# Run migration
python scripts/migrate_to_cloud.py --environment staging --verify
```

### URLs
- **Production:** https://learning-platform.vercel.app
- **Staging:** https://learning-platform-git-main.vercel.app
- **Preview:** https://learning-platform-git-feature-xyz.vercel.app

### Support
- **Documentation:** `/docs/CLOUD_TEST_ENVIRONMENTS.md`
- **Scripts:** `/scripts/`
- **Issues:** GitHub Issues with `cloud-environment` label