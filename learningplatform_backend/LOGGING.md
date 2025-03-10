# Backend Logging Guide

This document explains how to use and monitor the logging system for the Learning Platform backend.

## Overview

We've set up extensive logging to help diagnose connection and API issues. The logging system has several components:

1. **Log Files**:
   - `debug.log`: General Django and application logs
   - `auth.log`: Authentication-related logs (login, token refresh, etc.)
   - `api.log`: API request and response logs

2. **Diagnostic Tools**:
   - `check_logs.py`: Script to check for logs and monitor network connectivity

## Using the Diagnostic Tool

The `check_logs.py` script helps diagnose connectivity and logging issues:

```bash
# Run the script to check for logs and connectivity
python check_logs.py

# Make it executable first if needed
chmod +x check_logs.py
./check_logs.py
```

This script will:
1. Check if the Django server is running
2. Test network connectivity to the server
3. Look for and display log files
4. Offer to monitor logs in real time

## Manually Checking Logs

You can also check the logs directly:

```bash
# View the debug log
cat logs/debug.log

# Monitor logs in real time
tail -f logs/api.log

# Search for specific errors
grep "Error" logs/debug.log
```

## Troubleshooting Network Issues

If tests or the frontend can't connect to the backend:

1. **Check if the server is running**:
   ```bash
   ps aux | grep "python.*manage.py runserver"
   ```

2. **Verify the server is listening on all interfaces** (important for WSL):
   ```bash
   # Start the server with:
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Test connectivity**:
   ```bash
   curl http://localhost:8000/health/
   curl http://127.0.0.1:8000/health/
   ```

4. **Check which process is using port 8000**:
   ```bash
   sudo lsof -i :8000
   # or
   netstat -tuln | grep 8000
   ```

## Adding Custom Logging

To add logging in your code:

```python
import logging

# Get a logger
logger = logging.getLogger('api')  # or 'auth' or 'django'

# Log at different levels
logger.debug("Detailed debug info")
logger.info("General information")
logger.warning("Something concerning happened")
logger.error("An error occurred", exc_info=True)  # Include exception info
```

## Network Issues in WSL

If you're running in WSL and having connection issues:

1. **WSL Network Isolation**: WSL sometimes has network isolation that prevents localhost from being accessed correctly.
   
   Solution: Use the WSL IP address instead of localhost:
   ```
   # Find WSL IP
   ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
   ```

2. **Port Forwarding**: Make sure Windows isn't blocking the port.

3. **Run the server binding to all interfaces**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```