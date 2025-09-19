# Vercel Deployment Best Practices & Lessons Learned

*Compiled from implementing US-005A Pre-Production Environment Setup*

## 🎯 Overview

This document captures hard-earned lessons from implementing a complete Vercel deployment pipeline with Next.js 14, Prisma, and PostgreSQL. These practices will save hours of debugging in future projects.

## 🚀 Project Setup & Configuration

### ✅ **DO: Verify Project Configuration First**

**Always check these basics before starting:**

```bash
# Verify correct Vercel project
vercel projects list
vercel project inspect <project-name>

# Get the correct project ID
VERCEL_PROJECT_ID="prj_..." # Use the actual project ID, not a placeholder
```

**❌ Common Mistake:** Using outdated or duplicate project IDs after deleting/recreating projects.

### ✅ **DO: Use Consistent Environment Variable Management**

**Structure your environment variables properly:**

```bash
# GitHub Secrets (Repository Settings > Secrets)
VERCEL_TOKEN="vercel_token_here"
VERCEL_ORG_ID="team_id_here"
VERCEL_PROJECT_ID="prj_actual_project_id"

# Vercel Environment Variables (Project Settings > Environment Variables)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="generated_secret"
```

**✅ Best Practice:** Set environment variables for all environments (Development, Preview, Production) simultaneously in Vercel dashboard.

### ❌ **DON'T: Leave Placeholder Values**

**Wrong:**

```env
DATABASE_URL="your_database_url_here"
NEXTAUTH_SECRET="your_secret_here"
```

**Right:**

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_SECRET="actual_generated_secret_32_chars_min"
```

## 🏗️ Build Configuration

### ✅ **DO: Configure Build Commands for Monorepos**

**For projects with packages structure:**

```json
// vercel.json
{
  "buildCommand": "npm install --legacy-peer-deps && cd packages/database && npx prisma generate && cd ../.. && npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "outputDirectory": "apps/web/.next"
}
```

**Key Points:**

- Generate Prisma client from the **correct schema location** (`packages/database` not `apps/web`)
- Use `--legacy-peer-deps` if you have peer dependency conflicts
- Ensure the output directory matches your Next.js app location

### ❌ **DON'T: Assume Default Prisma Locations**

**Wrong:**

```json
"buildCommand": "npx prisma generate && npm run build"
```

**Right:**

```json
"buildCommand": "cd packages/database && npx prisma generate && cd ../.. && npm run build"
```

### ✅ **DO: Handle Production Environment Variables**

```json
// vercel.json
{
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "1"
    }
  }
}
```

**Why:** Prevents build failures when environment validation runs during build time.

## 🗄️ Database & Schema Management

### ✅ **DO: Use Explicit Table Mapping**

**Always specify table names explicitly in Prisma schema:**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())

  @@map("users")  // ✅ Explicit mapping
}

model Video {
  id        String      @id @default(uuid())
  prompt    String
  status    VideoStatus @default(QUEUED)
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  createdAt DateTime    @default(now())

  @@map("videos")  // ✅ Explicit mapping
}
```

**❌ Common Issue:** Prisma creates capitalized table names by default, but code expects lowercase names.

### ✅ **DO: Reset Database Schema Carefully**

**When database tables don't match schema:**

```bash
# 1. Always backup first (if production data exists)
# 2. Use force reset for development/staging
DATABASE_URL="..." npx prisma db push --force-reset

# 3. Verify tables exist after reset
# 4. Test API endpoints immediately
```

**⚠️ Warning:** Always get explicit user consent for dangerous database operations.

### ❌ **DON'T: Leave Schema/Code Mismatches**

**Common Issue:** API code references fields that don't exist in schema.

```typescript
// ❌ Wrong - fields don't exist in schema
const user = await prisma.user.findUnique({
  select: {
    videoQuota: true,    // ❌ Doesn't exist
    videosUsed: true,    // ❌ Doesn't exist
  }
});

// ✅ Right - only use existing fields
const user = await prisma.user.findUnique({
  select: {
    id: true,
    email: true,
    name: true,
    plan: true,
    createdAt: true,
  }
});
```

## 🔧 GitHub Actions & CI/CD

### ✅ **DO: Use Vercel CLI in GitHub Actions**

**Reliable deployment pattern:**

```yaml
- name: Deploy to Vercel (Pre-Production)
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    vercel pull --yes --environment=preview --token=$VERCEL_TOKEN
    vercel build --token=$VERCEL_TOKEN
    DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=$VERCEL_TOKEN)
    echo "deployment-url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT
```

### ❌ **DON'T: Use Deprecated GitHub Actions**

**Wrong:**

```yaml
- uses: vercel/action@v1  # ❌ Repository not found
```

**Right:**

```yaml
# Use Vercel CLI directly - more reliable and maintained
- name: Install Vercel CLI
  run: npm install -g vercel
```

### ✅ **DO: Add Quality Gates**

```yaml
# Always run these before deployment
- name: Run ESLint
  run: npm run lint

- name: Run TypeScript Check
  run: npm run type-check

- name: Run Tests
  run: npm test
```

## 🚨 Debugging & Troubleshooting

### ✅ **DO: Create Debug Endpoints**

**Invaluable for diagnosing deployment issues:**

```typescript
// /api/test-db/route.ts
export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    // Check table structure
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    // Check specific table columns
    const usersColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
    `;

    return NextResponse.json({
      status: "success",
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        hasDirect: !!process.env.DIRECT_URL,
      },
      tables,
      usersColumns,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### ✅ **DO: Handle Deployment Protection**

**For password-protected deployments:**

```bash
# Use bypass token for testing
curl "https://your-deployment.vercel.app/api/test?x-vercel-protection-bypass=YOUR_TOKEN"
```

### ✅ **DO: Check Deployment Logs Immediately**

```bash
# Monitor deployment status
gh run list --branch develop --limit 5

# Check failure logs
gh run view <run-id> --log-failed
```

**Common Build Failures:**

1. **TypeScript errors** - Field mismatches between schema and code
2. **Environment variable issues** - Missing or incorrect values
3. **Prisma generation failures** - Wrong schema path
4. **Project ID mismatches** - Outdated or incorrect project references

## 🔒 Security & Environment Management

### ✅ **DO: Use Environment-Specific Configuration**

```typescript
// Proper environment detection
const isProduction = process.env.VERCEL_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';

// Different configs per environment
const config = {
  database: isProduction ? prod_db_url : preview_db_url,
  logLevel: isProduction ? 'error' : 'debug',
};
```

### ✅ **DO: Add Security Headers**

```json
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

## ⚡ Performance & Optimization

### ✅ **DO: Add Health Check Endpoints**

```typescript
// /api/health/route.ts
export async function GET() {
  const checks = {
    database: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  return NextResponse.json({
    status: 'ok',
    checks,
  });
}
```

### ✅ **DO: Use URL Rewrites for Clean APIs**

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/healthz",
      "destination": "/api/health"
    }
  ]
}
```

## 🧪 Testing Strategies

### ✅ **DO: Test End-to-End Immediately**

**After each deployment fix, test the full user flow:**

```bash
# 1. Test database connectivity
curl https://your-app.vercel.app/api/test-db

# 2. Test user registration
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# 3. Verify data persistence
curl https://your-app.vercel.app/api/test-db | grep '"count"'

# 4. Test health endpoint
curl https://your-app.vercel.app/healthz
```

### ✅ **DO: Use Different Test Data Each Time**

```bash
# Use unique emails to avoid conflicts
email="test-$(date +%s)@example.com"
```

## 📚 Key Takeaways

### **🎯 Development Workflow**

1. **Always verify project setup first** (project ID, environment variables)
2. **Test locally when possible** before relying on deployed versions
3. **Use debug endpoints** to diagnose issues quickly
4. **Check deployment logs immediately** after failures
5. **Test end-to-end after each fix** to confirm resolution

### **🏗️ Architecture Decisions**

1. **Explicit over implicit** - Always specify table mappings, field selections
2. **Environment-specific configs** - Different settings per deployment environment
3. **Comprehensive error handling** - Catch and log deployment issues properly
4. **Security by default** - Add headers, validation, protection from day one

### **🚨 Common Pitfalls**

1. **Stale project IDs** after recreating Vercel projects
2. **Schema/code mismatches** when evolving database structure
3. **Wrong Prisma generation paths** in monorepo structures
4. **Missing environment variables** in different deployment environments
5. **Deprecated GitHub Actions** that suddenly break

### **⚡ Time-Saving Tips**

1. **Batch environment variable updates** across all environments at once
2. **Create reusable debug endpoints** for quick issue diagnosis
3. **Use explicit table mappings** to avoid PostgreSQL naming issues
4. **Set up quality gates early** to catch issues before deployment
5. **Document working patterns immediately** while context is fresh

---

## 🎉 Success Metrics

**A successful Vercel deployment should achieve:**

- ✅ **Build Success Rate**: 100% after configuration
- ✅ **API Response Time**: <1s for standard endpoints
- ✅ **Database Connectivity**: 100% uptime in health checks
- ✅ **End-to-End Functionality**: Full user workflows working
- ✅ **Security Headers**: Proper protection configured
- ✅ **Environment Isolation**: Clear separation between preview/production

**🚀 Ready to scale with confidence!**
