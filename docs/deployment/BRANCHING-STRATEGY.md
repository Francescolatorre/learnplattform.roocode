# Branching Strategy & Deployment Workflow

**Implemented**: 2025-09-20
**Status**: ✅ Develop branch created and configured successfully

## 🌿 Branch Structure

### Main Branches

#### `main` (Production)
- **Purpose**: Stable, production-ready code
- **Deployment**: Production environment (future)
- **Protection**: Protected branch, no direct commits
- **Updates**: Only via Pull Requests from `develop`
- **Testing**: Full test suite + manual QA required

#### `develop` (Preproduction)
- **Purpose**: Integration branch for active development
- **Deployment**: Preproduction environment (Railway + Vercel)
- **Current URL**:
  - Frontend: https://learnplattform-roocode.vercel.app
  - Backend: https://learnplattformroocode-preproduction.up.railway.app
- **Updates**: Direct commits + feature branch merges
- **Testing**: Automated tests + integration testing

### Feature Branches
- **Pattern**: `feature/TASK-XXX-description` or `feature/REQ-XXX-description`
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via Pull Request
- **Lifecycle**: Short-lived, deleted after merge

## 🚀 Deployment Configuration

### Current Configuration (✅ Completed 2025-09-20)

#### Railway (Backend) ✅
- **Configured**: Now deploys from `develop` branch
- **Environment**: preproduction
- **Service**: learnplattform.roocode
- **Status**: Active and working

#### Vercel (Frontend) ✅
- **Configured**: Preview deployments from "All unassigned branches" (includes `develop`)
- **Environment**: preview
- **Project**: learnplatform-frontend
- **Status**: Active and working

### Required Configuration Changes

#### 1. Railway Configuration
```bash
# Access Railway dashboard
# Navigate to: Project → heroic-trust → learnplattform.roocode → Settings
# Update deployment branch from 'main' to 'develop'
```

#### 2. Vercel Configuration
```bash
# Access Vercel dashboard
# Navigate to: learnplatform-frontend → Settings → Git
# Update production branch from 'main' to 'develop'
```

## 📋 Workflow Process

### Development Workflow
1. **Start Feature**: `git checkout develop && git pull && git checkout -b feature/TASK-XXX-description`
2. **Develop**: Make changes, commit regularly
3. **Test Locally**: Ensure all tests pass
4. **Push Feature**: `git push -u origin feature/TASK-XXX-description`
5. **Create PR**: Target `develop` branch
6. **Code Review**: Team review and approval
7. **Merge**: Squash and merge to `develop`
8. **Auto-Deploy**: Automatic deployment to preproduction
9. **Integration Test**: Verify in preproduction environment

### Release Workflow (Future)
1. **Release Branch**: `git checkout develop && git checkout -b release/v1.x.x`
2. **Final Testing**: Bug fixes only, no new features
3. **Production PR**: Create PR from `release/v1.x.x` to `main`
4. **Production Deploy**: Merge triggers production deployment
5. **Tag Release**: `git tag v1.x.x && git push --tags`
6. **Merge Back**: Merge `main` back to `develop` for any hotfixes

### Hotfix Workflow (Future)
1. **Hotfix Branch**: `git checkout main && git checkout -b hotfix/critical-issue`
2. **Fix & Test**: Critical bug fix with minimal changes
3. **Production PR**: Direct to `main` for immediate deployment
4. **Merge Back**: Merge hotfix to both `main` and `develop`

## 🔧 Manual Configuration Steps Required

### Step 1: Railway Branch Configuration
1. Go to Railway dashboard: https://railway.app
2. Navigate to Project: heroic-trust
3. Select Service: learnplattform.roocode
4. Go to Settings → Source
5. Change deployment branch from `main` to `develop`
6. Save configuration

### Step 2: Vercel Branch Configuration
1. Go to Vercel dashboard: https://vercel.com
2. Navigate to Project: learnplatform-frontend
3. Go to Settings → Git
4. Change production branch from `main` to `develop`
5. Configure branch protection if needed
6. Save configuration

### Step 3: Immediate Deployment Test
1. Make a small change on `develop` branch
2. Push to trigger deployment
3. Verify both Railway and Vercel deploy from `develop`
4. Test end-to-end functionality

## 📊 Environment Mapping

| Branch | Environment | Frontend URL | Backend URL | Purpose |
|--------|-------------|--------------|-------------|---------|
| `develop` | Preproduction | https://learnplattform-roocode.vercel.app | https://learnplattformroocode-preproduction.up.railway.app | Active development & testing |
| `main` | Production | TBD | TBD | Stable releases (future) |

## 🛡️ Branch Protection Rules

### `main` Branch (Future Implementation)
- Require Pull Request reviews (2 reviewers)
- Require status checks (all tests must pass)
- Require up-to-date branches before merging
- Restrict push access (only via PR)
- Require signed commits

### `develop` Branch (Current)
- Allow direct commits for rapid development
- Require basic status checks
- Optional PR reviews for major changes

## 🚨 Current Action Items

### Immediate (Manual Configuration Required)
- [ ] **Railway**: Change deployment branch from `main` to `develop`
- [ ] **Vercel**: Change production branch from `main` to `develop`
- [ ] **Test**: Verify deployments work from `develop` branch
- [ ] **Document**: Update PREPROD-ENVIRONMENT-INFO.md with new branch info

### Future (Production Setup)
- [ ] **Production Environments**: Set up separate production Railway/Vercel projects
- [ ] **Branch Protection**: Implement GitHub branch protection rules
- [ ] **CI/CD Pipeline**: Enhanced GitHub Actions for production deployments
- [ ] **Monitoring**: Set up production monitoring and alerting

## 📝 Benefits of This Strategy

### ✅ Advantages
- **Clear Separation**: Development vs production environments
- **Safe Testing**: All changes tested in preproduction first
- **Rapid Development**: Direct commits to `develop` for speed
- **Stable Production**: `main` branch always deployable
- **Feature Isolation**: Feature branches prevent conflicts

### 🔄 Current vs Target State

#### Before (Current Issue)
- `main` → Production (but we're still developing)
- All development changes go directly to production
- No proper testing environment separation

#### After (Target State)
- `develop` → Preproduction (testing & integration)
- `main` → Production (stable releases only)
- Clear environment separation and testing workflow

---

**Next Steps**: Manual configuration of Railway and Vercel deployment branches required via their respective dashboards.