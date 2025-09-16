# Cloud Test Environment Team Training Guide

## Overview

This guide provides step-by-step training for team members to effectively use our cloud test environments with Vercel and Neon. Complete all sections to become proficient with the new workflow.

## Prerequisites

### Required Knowledge
- [ ] Git workflow (branches, pull requests, merging)
- [ ] Basic command line usage
- [ ] Understanding of environment variables
- [ ] Familiarity with our Django + React application

### Required Tools
- [ ] Git installed and configured
- [ ] Node.js 20+ installed
- [ ] Python 3.11+ installed
- [ ] VS Code or preferred IDE
- [ ] Access to GitHub repository

## Training Modules

### Module 1: Understanding Cloud Test Environments (30 minutes)

#### What are Cloud Test Environments?
Cloud test environments provide isolated, production-like environments for testing changes before they reach production. Our setup includes:

- **Vercel**: Hosts frontend and provides serverless backend
- **Neon**: Serverless PostgreSQL database with branching
- **GitHub Actions**: Automated CI/CD pipeline

#### Benefits
- ✅ **Isolated Testing**: Each PR gets its own environment
- ✅ **Production-like**: Real cloud infrastructure, not local
- ✅ **Automated**: Created and cleaned up automatically
- ✅ **Collaborative**: Easy sharing with team members
- ✅ **Fast Feedback**: Quick deployment and testing cycles

#### Architecture Overview
```
Feature Branch → Pull Request → Preview Environment
                                ├── Neon Database Branch
                                └── Vercel Preview Deployment
```

### Module 2: CLI Tools Setup (45 minutes)

#### Install Vercel CLI
```bash
# Install globally
npm install -g vercel@latest

# Verify installation
vercel --version

# Login to Vercel
vercel login
```

#### Install Neon CLI
```bash
# Install globally
npm install -g neonctl

# Verify installation
neonctl --version

# Authenticate (requires API key from instructor)
neonctl auth
```

#### Test CLI Access
```bash
# Test Vercel access
vercel projects ls

# Test Neon access
neonctl projects list
```

**✅ Checkpoint**: Verify both CLIs work before proceeding.

### Module 3: Feature Development Workflow (60 minutes)

#### Step 1: Create Feature Branch
```bash
# Start from main branch
git checkout main
git pull origin main

# Create feature branch (follow naming convention)
git checkout -b feature/TASK-XXX-your-feature-description
```

#### Step 2: Make Changes
1. Implement your feature in the appropriate files
2. Write/update tests as needed
3. Test locally:
   ```bash
   # Backend
   cd backend
   source .venv/Scripts/activate  # Windows
   python manage.py runserver

   # Frontend (new terminal)
   cd frontend
   npm run dev
   ```

#### Step 3: Push and Create PR
```bash
# Add and commit changes
git add .
git commit -m "TASK-XXX: Brief description of changes"

# Push feature branch
git push origin feature/TASK-XXX-your-feature-description
```

#### Step 4: Create Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill out PR template:
   - **Title**: `TASK-XXX: Brief description`
   - **Description**: What changed and why
   - **Testing**: How to test the changes

#### Step 5: Wait for Preview Environment
- GitHub Actions automatically creates preview environment
- Takes ~3-5 minutes for full deployment
- PR comment will include preview URL and test credentials

#### Step 6: Test Preview Environment
1. Click preview URL from PR comment
2. Test your changes thoroughly
3. Use provided test credentials:
   - Student: `student` / `student123`
   - Instructor: `instructor` / `instructor123`

**🎯 Exercise**: Create a simple feature branch, make a small change, and create a PR to see the preview environment in action.

### Module 4: Testing and Validation (45 minutes)

#### Manual Testing Checklist
- [ ] Preview URL loads correctly
- [ ] Your feature works as expected
- [ ] Authentication works with test credentials
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Performance feels acceptable

#### Automated Testing
The CI pipeline runs these tests automatically:
- **Unit Tests**: Test individual components/functions
- **Integration Tests**: Test API endpoints and services
- **E2E Tests**: Test complete user workflows
- **Preview Tests**: Smoke tests against preview environment

#### Validation Script
Run comprehensive validation manually:
```bash
# Basic health check
python scripts/validate_cloud_environment.py --environment staging --health-only

# Comprehensive testing (includes performance and security)
python scripts/validate_cloud_environment.py --environment staging --comprehensive
```

#### Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Build Failure** | No preview URL in PR | Check GitHub Actions logs, fix build errors |
| **Database Error** | 500 errors on preview | Check database migrations, verify connection |
| **Environment Variables** | Features not working | Verify env vars are set in Vercel |
| **Slow Loading** | Preview takes too long | Check performance, optimize if needed |

**🎯 Exercise**: Run validation script against an existing preview environment and interpret the results.

### Module 5: Debugging and Troubleshooting (30 minutes)

#### Accessing Logs

1. **GitHub Actions Logs**:
   - Go to PR → "Checks" tab
   - Click on failing job to see logs

2. **Vercel Deployment Logs**:
   ```bash
   vercel logs YOUR_PREVIEW_URL
   ```

3. **Local Debugging**:
   ```bash
   # Test with preview environment variables
   VITE_API_BASE_URL=https://your-preview.vercel.app npm run dev
   ```

#### Common Debugging Steps
1. **Check Build Logs**: First place to look for issues
2. **Verify Environment Variables**: Ensure all required vars are set
3. **Test Database Connection**: Use provided connection string
4. **Check API Endpoints**: Use browser dev tools or curl
5. **Validate Frontend Build**: Ensure assets are generated correctly

#### Emergency Procedures
```bash
# If preview environment is broken, clean up and retry
neonctl branches delete pr-123 --project-id YOUR_PROJECT_ID

# Manually trigger new deployment
vercel deploy
```

**🎯 Exercise**: Intentionally break something small and practice debugging it.

### Module 6: Collaboration and Code Review (30 minutes)

#### Using Preview Environments for Review
- **Share Preview URL**: Include in PR description or Slack
- **Test Different Scenarios**: Create test data, test edge cases
- **Performance Testing**: Check loading times, responsiveness
- **Cross-browser Testing**: Test in different browsers if needed

#### Providing Feedback
- **Specific Issues**: Include steps to reproduce
- **Screenshots**: Visual issues are easier with images
- **Test Credentials**: Always use provided test accounts
- **Environment Context**: Mention if issue is environment-specific

#### Reviewer Checklist
- [ ] Preview environment loads correctly
- [ ] Feature works as described in PR
- [ ] No obvious bugs or usability issues
- [ ] Performance is acceptable
- [ ] Automated tests are passing
- [ ] Code follows team standards

**🎯 Exercise**: Review a teammate's PR using their preview environment.

### Module 7: Advanced Features (30 minutes)

#### Manual Environment Management
```bash
# Create database branch for long-running feature
python scripts/setup_neon_branch.py --branch-name feature-xyz --env-file

# Deploy custom preview
vercel deploy --env DATABASE_URL="your-custom-db-url"
```

#### Performance Optimization
- **Bundle Analysis**: Use Vercel's bundle analyzer
- **Database Optimization**: Monitor Neon metrics
- **Caching**: Leverage Vercel's edge caching

#### Environment-Specific Configuration
- **Staging**: More production-like settings
- **Preview**: Debug mode enabled, test data
- **Production**: Optimized for performance and security

**🎯 Exercise**: Create a manual database branch and deploy a custom preview environment.

## Certification Checklist

Complete all items to be certified for cloud test environment usage:

### Basic Proficiency
- [ ] Set up CLI tools (Vercel and Neon)
- [ ] Create feature branch following naming convention
- [ ] Make changes and create pull request
- [ ] Test changes using preview environment
- [ ] Understand how to read GitHub Actions logs

### Intermediate Skills
- [ ] Run validation scripts against preview environment
- [ ] Debug common deployment issues
- [ ] Provide effective code review using preview URL
- [ ] Understand environment variable management

### Advanced Skills
- [ ] Create manual database branches when needed
- [ ] Troubleshoot complex deployment issues
- [ ] Optimize preview environment performance
- [ ] Help team members with cloud environment issues

## Quick Reference

### Essential Commands
```bash
# Verify CLI setup
vercel --version && neonctl --version

# Create feature branch
git checkout -b feature/TASK-XXX-description

# Validate environment
python scripts/validate_cloud_environment.py --environment staging

# Check deployment logs
vercel logs YOUR_PREVIEW_URL

# List database branches
neonctl branches list --project-id YOUR_PROJECT_ID
```

### Essential URLs
- **Repository**: https://github.com/your-org/learning-platform
- **Production**: https://learning-platform.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech

### Support Resources
- **Documentation**: `/docs/CLOUD_TEST_ENVIRONMENTS.md`
- **Slack Channel**: `#cloud-environments`
- **Team Wiki**: Link to internal wiki
- **Office Hours**: Weekly Q&A sessions

### Emergency Contacts
- **DevOps Team**: @devops-team on Slack
- **On-call Engineer**: Check team calendar
- **Escalation**: Team lead contact info

## Training Schedule

### Week 1: Foundation
- **Day 1-2**: Modules 1-2 (Understanding + CLI Setup)
- **Day 3-4**: Module 3 (Feature Development Workflow)
- **Day 5**: Module 4 (Testing and Validation)

### Week 2: Advanced
- **Day 1-2**: Module 5 (Debugging and Troubleshooting)
- **Day 3-4**: Module 6 (Collaboration and Code Review)
- **Day 5**: Module 7 (Advanced Features) + Certification

### Ongoing
- **Weekly**: Office hours for questions
- **Monthly**: Advanced topics and optimization
- **Quarterly**: Tool updates and new features

## Feedback and Improvement

After completing training, please provide feedback:

### Training Feedback Form
- **What worked well?**
- **What was confusing?**
- **What additional topics would be helpful?**
- **How can we improve the documentation?**

### Continuous Learning
- **Stay Updated**: Follow changelog for Vercel and Neon
- **Share Knowledge**: Contribute to team wiki and documentation
- **Best Practices**: Share tips and tricks with team
- **Tool Mastery**: Explore advanced features as you become comfortable

---

**Congratulations!** 🎉 You're now ready to use cloud test environments effectively. Remember, the team is here to help if you run into any issues.