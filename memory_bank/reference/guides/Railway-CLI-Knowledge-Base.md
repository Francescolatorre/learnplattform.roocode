# Railway CLI Knowledge Base

## 🚄 Authentication & Setup

### Login/Logout
```bash
railway login              # Login to Railway account
railway logout             # Logout from Railway
railway whoami             # Check current logged in user
```

## 📋 Project Management

### Project Discovery
```bash
railway list               # List all projects in your account
railway init               # Create a new project
railway link [projectId]   # Link current directory to existing project
railway unlink             # Disassociate project from current directory
```

### Project Information
```bash
railway status             # Show information about current linked project
railway open               # Open project dashboard in browser
```

## 🚀 Deployment & Services

### Deployment
```bash
railway up                 # Upload and deploy project from current directory
railway deploy             # Provisions a template into your project
railway redeploy           # Redeploy the latest deployment of a service
railway down               # Remove the most recent deployment
```

### Service Management
```bash
railway add                # Add a service to your project
railway service            # Link a service to the current project
railway logs               # View a deploy's logs
railway ssh                # Connect to a service via SSH
```

## 🌐 Domains & Networking

### Domain Management
```bash
railway domain             # Add custom domain or generate railway provided domain
```

## 📊 Environment & Variables

### Environment Management
```bash
railway environment        # Create, delete or link an environment
railway env                # Alias for environment
railway variables          # Show variables for active environment
```

### Local Development
```bash
railway run [command]      # Run local command using Railway variables
railway shell              # Open subshell with Railway variables available
```

## 💾 Database & Storage

### Database Access
```bash
railway connect            # Connect to database shell (psql/mongosh/etc.)
railway volume             # Manage project volumes
```

## 🔧 Utilities

### Development Tools
```bash
railway docs               # Open Railway Documentation in browser
railway completion         # Generate completion script
railway scale              # Scale services
railway functions          # Manage project functions (alias: func, fn)
```

## 📈 Monitoring & Debugging

### Logs & Status
```bash
railway logs               # View deployment logs
railway logs --follow      # Follow logs in real-time
railway logs --tail 100    # Show last 100 log lines
```

## 🎯 Common Workflows

### 1. Initial Project Setup
```bash
# In your project directory
railway login
railway init
railway link
```

### 2. Check Deployment Status
```bash
railway status
railway logs
railway open
```

### 3. Deploy Changes
```bash
railway up
railway logs --follow
```

### 4. Environment Management
```bash
railway variables
railway environment list
railway environment switch [name]
```

### 5. Database Access
```bash
railway connect
# Connects to your database shell
```

## ⚠️ Important Notes

- **Project Linking**: Must `railway link` before using project-specific commands
- **Authentication**: Login persists across sessions
- **Environment Context**: Commands operate on currently linked environment
- **Service Context**: Some commands require service selection in multi-service projects

## 🔍 Troubleshooting

### Common Issues
1. **"No linked project found"** → Run `railway link`
2. **Authentication errors** → Run `railway login`
3. **Service not found** → Check `railway service` or use `railway add`
4. **Deployment fails** → Check `railway logs` for errors

### Debugging Commands
```bash
railway status              # Overall project health
railway logs                # Deployment errors
railway variables           # Environment configuration
railway whoami              # Authentication status
```

## 📚 External Resources

- [Official Railway Docs](https://docs.railway.app)
- [Railway CLI GitHub](https://github.com/railwayapp/cli)
- [Railway Status](https://status.railway.app)

---

*Knowledge Base created for efficient Railway CLI usage and deployment monitoring.*