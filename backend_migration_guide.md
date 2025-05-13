# Django Backend Migration Guide

## Overview

This guide explains how to switch from the old `learningplatform_backend` structure to the new `Backend` structure that follows Django best practices.

## What Has Been Restructured

The project has been reorganized to follow Django's recommended structure:

- Renamed the project root from `learningplatform_backend` to `Backend`
- Created a separate `config` directory for Django settings
- Properly organized apps with clear separation of concerns
- Fixed import paths to use explicit, absolute imports
- Maintained all existing functionality while resolving import conflicts

## How to Switch to the New Structure

1. **Activate Your Virtual Environment**:

   ```bash
   # Activate your existing virtual environment
   ```

2. **Install Dependencies**:

   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

3. **Run Initial Test**:

   ```bash
   cd Backend
   python manage.py check
   ```

   This will verify that your settings and imports are correctly configured.

4. **Run Migrations**:

   ```bash
   cd Backend
   python manage.py migrate
   ```

5. **Start the Server**:

   ```bash
   cd Backend
   python manage.py runserver
   ```

## Key Files to Note

- **Settings**: `Backend/config/settings.py`
- **URL Configuration**: `Backend/config/urls.py`
- **Application Entry Point**: `Backend/manage.py`
- **Core Models**: `Backend/core/models.py`

## Improved Directory Structure

```
Backend/
├── config/              # Project settings (was learningplatform_backend/learningplatform_backend)
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── core/                # Main application
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── ...
├── utils/               # Utility functions
│   ├── __init__.py
│   └── markdown_utils.py
└── manage.py
```

## Additional Steps (If Needed)

If you encounter any issues with imports or module resolution:

1. Make sure `INSTALLED_APPS` in `config/settings.py` includes all your apps
2. Check for any hardcoded references to the old project structure in your code
3. Verify that your `DJANGO_SETTINGS_MODULE` environment variable is set to `config.settings`

## Troubleshooting

If you encounter a "No module named 'config'" error:

- Make sure you're running commands from the `Backend` directory
- Verify that the `Backend` directory is in your Python path

For database connection issues:

- Check that your database path in settings.py is correctly configured
- The default SQLite path may need adjustment based on the new root directory
