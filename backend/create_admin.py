#!/usr/bin/env python
"""
Admin User Creation Script

This script creates a superuser account using credentials from environment variables.
NEVER hardcode credentials - always use environment variables!

Required environment variables:
    ADMIN_USERNAME: Username for the admin account (default: admin)
    ADMIN_EMAIL: Email for the admin account (default: admin@learnplatform.dev)
    ADMIN_PASSWORD: Password for the admin account (REQUIRED, min 8 chars)

Usage:
    Local development:
        python create_admin.py

    Railway deployment:
        Set environment variables in Railway dashboard, then:
        railway run python create_admin.py
"""
import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User


def get_admin_credentials():
    """Get admin credentials from environment variables with validation."""
    username = os.environ.get('ADMIN_USERNAME', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@learnplatform.dev')
    password = os.environ.get('ADMIN_PASSWORD')

    # Validate password
    if not password:
        print('❌ ERROR: ADMIN_PASSWORD environment variable is required!')
        print('   Set it in your .env file or Railway environment variables.')
        print('   Example: ADMIN_PASSWORD=YourSecurePassword123!')
        sys.exit(1)

    if len(password) < 8:
        print(f'❌ ERROR: Password too short ({len(password)} chars)')
        print('   Minimum length: 8 characters')
        print('   Recommended: 12+ chars with mixed case, numbers, and symbols')
        sys.exit(1)

    return username, email, password


def create_admin_user():
    """Create or verify admin user exists."""
    username, email, password = get_admin_credentials()

    if not User.objects.filter(username=username).exists():
        try:
            admin_user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print('✅ Superuser created successfully!')
            print(f'   Username: {admin_user.username}')
            print(f'   Email: {admin_user.email}')
            print(f'   Role: {admin_user.role}')
            print(f'   Is Staff: {admin_user.is_staff}')
            print(f'   Is Superuser: {admin_user.is_superuser}')
            print('\n🔒 SECURITY REMINDER:')
            print('   - Password is stored securely (hashed)')
            print('   - Change default password in production')
            print('   - Never commit passwords to version control')
        except Exception as e:
            print(f'❌ ERROR: Failed to create superuser: {e}')
            sys.exit(1)
    else:
        existing_user = User.objects.get(username=username)
        print('⚠️  Admin user already exists!')
        print(f'   Username: {existing_user.username}')
        print(f'   Email: {existing_user.email}')
        print(f'   Role: {existing_user.role}')
        print('\n💡 TIP: To reset password, use Django management command:')
        print(f'   python manage.py changepassword {username}')


if __name__ == '__main__':
    print('🔧 Admin User Setup')
    print('=' * 50)
    create_admin_user()