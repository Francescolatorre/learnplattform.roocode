"""
Core Django application for the Learning Platform.

This module serves as the main application package for core functionality including:
- User management and authentication
- Course and learning task models
- Progress tracking
- Quiz functionality
"""

# Django app module declaration
# DONT IMPORT MODELS HERE, IT WILL CAUSE CIRCULAR IMPORTS
# This file is used to declare the app module for Django
default_app_config = "core.apps.CoreConfig"
