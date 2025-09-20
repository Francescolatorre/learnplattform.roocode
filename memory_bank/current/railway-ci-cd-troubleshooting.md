# Railway CI/CD Deployment Troubleshooting Guide

*Date: 2025-09-19*
*Context: Fixing Railway deployment failures in GitHub Actions pipeline*

## Summary

This document captures our learnings from troubleshooting Railway deployment issues in our CI/CD pipeline. The goal was to get automated deployment from GitHub Actions to Railway working reliably.

## Problem Overview

The Railway deployment was consistently failing in our GitHub Actions pipeline with various authentication and configuration issues.

## Troubleshooting Journey

### 1. Initial Issue: Unsupported Login Command
**Problem**: Pipeline used `railway login --token ${{ secrets.RAILWAY_TOKEN }}`
**Error**: The `--token` flag is not supported by Railway CLI
**Solution**: Removed the login step entirely - Railway CLI uses `RAILWAY_TOKEN` environment variable automatically

### 2. Authentication via Environment Variables
**Approach**: Set `RAILWAY_TOKEN` as environment variable instead of using login command
**Configuration**:
```yaml
env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```
**Result**: Authentication worked, but deployment still failed

### 3. Service Name Issues
**Problem**: Railway couldn't find the specified service
**Initial service name**: `learnplatform-backend`
**Actual service name**: `learnplattform.roocode` (provided by user)
**Solution**: Updated service name in deployment command

### 4. Official Railway CI/CD Pattern
**Research**: Studied Railway's official blog post on GitHub Actions integration
**Key findings**:
- Use official Railway CLI container: `ghcr.io/railwayapp/cli:latest`
- No manual login required when using container + token
- Simpler, more reliable approach

**Final container configuration**:
```yaml
container: ghcr.io/railwayapp/cli:latest
```

### 5. Project Linking Issues
**Problem**: Railway CLI needed project context for deployment
**First attempt**: Added `railway link ${{ vars.RAILWAY_PROJECT_ID }}` step
**Issue**: `RAILWAY_PROJECT_ID` variable was empty, causing link command to fail
**Solution**: Use `--project` flag directly in deployment command

## Final Working Configuration

```yaml
deploy:
  name: Deploy Backend to Railway
  runs-on: ubuntu-latest
  container: ghcr.io/railwayapp/cli:latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  steps:
    - uses: actions/checkout@v4
    - run: railway up --service=${{ vars.RAILWAY_SERVICE_ID || 'learnplattform.roocode' }} --project=${{ vars.RAILWAY_PROJECT_ID }}
```

## Key Learnings

### Railway CLI Best Practices for CI/CD

1. **Use Official Container**: `ghcr.io/railwayapp/cli:latest` is more reliable than installing CLI manually
2. **Environment-based Authentication**: Set `RAILWAY_TOKEN` as environment variable, no manual login needed
3. **Direct Service Specification**: Use `--service` flag to specify exact service name
4. **Project Context**: Use `--project` flag if needed, or rely on token context
5. **Avoid Separate Linking Steps**: Combine project/service specification with deployment command

### Common Pitfalls

1. **Don't use `railway login --token`** - This flag doesn't exist
2. **Don't assume service names** - Always verify the exact service name in Railway dashboard
3. **Don't complicate project linking** - Use flags instead of separate `railway link` steps
4. **Check variable availability** - Ensure GitHub repository variables are properly set

### Required GitHub Secrets/Variables

- `RAILWAY_TOKEN` (Secret): Account token from Railway dashboard
- `RAILWAY_PROJECT_ID` (Variable, optional): Project ID if using --project flag
- `RAILWAY_SERVICE_ID` (Variable, optional): Service ID for fallback specification

## Service Configuration

**Project**: Learning Platform
**Service Name**: `learnplattform.roocode`
**Deployment Context**: Backend Django application
**Dockerfile**: Located at project root, builds Django backend

## Testing Strategy

1. **Pipeline Monitoring**: Use `gh run watch` to monitor deployment progress
2. **Health Check**: Test application health endpoint after successful deployment
3. **Log Analysis**: Check Railway deployment logs for any runtime issues
4. **Rollback Plan**: Maintain ability to rollback if deployment introduces issues

## Documentation References

- [Railway CLI Documentation](https://docs.railway.com/reference/cli-api)
- [Railway GitHub Actions Guide](https://blog.railway.com/p/github-actions)
- [Railway Container Deployment](https://docs.railway.com/guides/deployments)

## Current Status (Updated)

**Current State**: Still troubleshooting - all standard approaches exhausted
**Deployment Status**: All Railway deployment attempts failing with exit code 1

### Attempted Solutions (All Failed)
1. ✅ Fixed CLI authentication (removed --token flag)
2. ✅ Used official Railway container (`ghcr.io/railwayapp/cli:latest`)
3. ✅ Corrected service name (`learnplattform.roocode`)
4. ✅ Tried project linking (`railway link`) - failed due to missing RAILWAY_PROJECT_ID
5. ✅ Tried project flag (`--project`) - failed due to empty RAILWAY_PROJECT_ID
6. ✅ Simplified command (`railway up --service=learnplattform.roocode`) - still failing

### Remaining Issues to Investigate

Since all standard approaches are failing, the issue is likely:

1. **Railway Token Issues**
   - Token may be expired, invalid, or revoked
   - Token may not have sufficient permissions
   - Check: Railway dashboard → Account Settings → Tokens

2. **Service/Project Configuration**
   - Service name may not be exactly `learnplattform.roocode`
   - Token may not have access to the specific project
   - Check: Railway dashboard → Project → Services list

3. **Account Access**
   - Token may be associated with wrong account/organization
   - Project may have restricted access
   - Check: Railway dashboard → Project → Settings → Access

4. **Service Deployment Requirements**
   - Service may require specific configuration
   - May need environment variables or build settings
   - Check: Railway dashboard → Service → Settings

### Next Steps Required

**Manual verification needed:**
1. Verify Railway token is valid and has project access
2. Confirm exact service name in Railway dashboard
3. Check token permissions and project access
4. Verify service configuration allows CLI deployments

**Command to test locally:**
```bash
export RAILWAY_TOKEN="<your-token>"
railway up --service=learnplattform.roocode
```

---

*This document should be updated as we learn more about Railway deployment patterns and encounter new issues.*