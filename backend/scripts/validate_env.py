#!/usr/bin/env python
"""
Environment Variable Validation Script

Validates that all required environment variables are set and meet security requirements.
Run this before deployment to catch configuration issues early.

Usage:
    python scripts/validate_env.py
    python scripts/validate_env.py --strict  # Fail on warnings too
"""
import os
import sys
import re
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not required in production


class ValidationResult:
    """Stores validation results."""
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []

    def add_error(self, message):
        self.errors.append(f"❌ ERROR: {message}")

    def add_warning(self, message):
        self.warnings.append(f"⚠️  WARNING: {message}")

    def add_info(self, message):
        self.info.append(f"ℹ️  INFO: {message}")

    def has_issues(self, strict=False):
        return len(self.errors) > 0 or (strict and len(self.warnings) > 0)

    def print_results(self):
        if self.errors:
            print("\n🔴 ERRORS:")
            for error in self.errors:
                print(f"  {error}")

        if self.warnings:
            print("\n🟡 WARNINGS:")
            for warning in self.warnings:
                print(f"  {warning}")

        if self.info:
            print("\n🔵 INFO:")
            for info in self.info:
                print(f"  {info}")


def validate_secret_key(result):
    """Validate Django SECRET_KEY."""
    secret_key = os.getenv('SECRET_KEY', '')

    if not secret_key:
        result.add_error("SECRET_KEY is not set")
        return

    if 'django-insecure' in secret_key.lower():
        result.add_warning("SECRET_KEY contains 'django-insecure' - generate new key for production")

    if 'REPLACE' in secret_key or 'your-secret-key' in secret_key.lower():
        result.add_error("SECRET_KEY has not been changed from template value")
        return

    if len(secret_key) < 50:
        result.add_warning(f"SECRET_KEY is short ({len(secret_key)} chars) - recommended 50+ chars")

    result.add_info(f"SECRET_KEY is set ({len(secret_key)} chars)")


def validate_debug_mode(result):
    """Validate DEBUG setting."""
    debug = os.getenv('DEBUG', 'True')
    railway_env = os.getenv('RAILWAY_ENVIRONMENT', 'local')

    result.add_info(f"DEBUG={debug}")

    if railway_env in ['production', 'preproduction'] and debug.lower() in ['true', '1', 'yes']:
        result.add_error(f"DEBUG is True in {railway_env} environment - SECURITY RISK!")


def validate_database(result):
    """Validate database configuration."""
    database_url = os.getenv('DATABASE_URL', '')

    if not database_url:
        result.add_warning("DATABASE_URL not set - using SQLite (OK for development)")
        return

    if 'sqlite' in database_url.lower():
        result.add_info("Using SQLite database")
    elif 'postgresql' in database_url.lower() or 'postgres' in database_url.lower():
        result.add_info("Using PostgreSQL database")

        # Check for secure connection
        if 'sslmode=require' not in database_url and 'neon.tech' in database_url:
            result.add_warning("PostgreSQL connection should use SSL (add ?sslmode=require)")
    else:
        result.add_warning(f"Unknown database type in DATABASE_URL")


def validate_admin_credentials(result):
    """Validate admin user credentials."""
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_email = os.getenv('ADMIN_EMAIL', '')
    admin_password = os.getenv('ADMIN_PASSWORD', '')

    result.add_info(f"Admin username: {admin_username}")

    if not admin_email:
        result.add_warning("ADMIN_EMAIL not set - will use default")
    elif '@' not in admin_email:
        result.add_error("ADMIN_EMAIL is not a valid email address")

    if not admin_password:
        result.add_error("ADMIN_PASSWORD not set - required for create_admin.py script")
        return

    # Check password strength
    if admin_password in ['ChangeMe123!SecurePassword', 'AdminPass123!', 'admin', '123456']:
        result.add_error("ADMIN_PASSWORD is using a common/default password - CHANGE IMMEDIATELY!")
        return

    if len(admin_password) < 8:
        result.add_error(f"ADMIN_PASSWORD too short ({len(admin_password)} chars) - minimum 8 required")
    elif len(admin_password) < 12:
        result.add_warning(f"ADMIN_PASSWORD could be stronger ({len(admin_password)} chars) - 12+ recommended")
    else:
        result.add_info(f"ADMIN_PASSWORD length OK ({len(admin_password)} chars)")

    # Check password complexity
    has_upper = any(c.isupper() for c in admin_password)
    has_lower = any(c.islower() for c in admin_password)
    has_digit = any(c.isdigit() for c in admin_password)
    has_special = any(not c.isalnum() for c in admin_password)

    missing = []
    if not has_upper:
        missing.append("uppercase")
    if not has_lower:
        missing.append("lowercase")
    if not has_digit:
        missing.append("numbers")
    if not has_special:
        missing.append("special chars")

    if missing:
        result.add_warning(f"ADMIN_PASSWORD missing: {', '.join(missing)}")


def validate_cors_csrf(result):
    """Validate CORS and CSRF configuration."""
    railway_env = os.getenv('RAILWAY_ENVIRONMENT', 'local')

    if railway_env in ['production', 'preproduction']:
        cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
        csrf_origins = os.getenv('CSRF_TRUSTED_ORIGINS', '')

        if not cors_origins:
            result.add_info("CORS_ALLOWED_ORIGINS not set - using defaults from settings.py")

        if not csrf_origins:
            result.add_info("CSRF_TRUSTED_ORIGINS not set - using defaults from settings.py")


def validate_deployment_config(result):
    """Validate deployment-specific configuration."""
    railway_env = os.getenv('RAILWAY_ENVIRONMENT', 'local')
    django_admin_url = os.getenv('DJANGO_ADMIN_URL', 'admin/')

    result.add_info(f"Environment: {railway_env}")
    result.add_info(f"Admin URL: /{django_admin_url}")

    if railway_env in ['production'] and django_admin_url == 'admin/':
        result.add_warning("Using default admin URL in production - customize for security")


def main():
    """Main validation function."""
    strict = '--strict' in sys.argv

    print("🔍 Environment Variable Validation")
    print("=" * 70)

    result = ValidationResult()

    # Run all validations
    validate_secret_key(result)
    validate_debug_mode(result)
    validate_database(result)
    validate_admin_credentials(result)
    validate_cors_csrf(result)
    validate_deployment_config(result)

    # Print results
    result.print_results()

    # Summary
    print("\n" + "=" * 70)
    if result.errors:
        print(f"❌ Validation FAILED: {len(result.errors)} error(s), {len(result.warnings)} warning(s)")
        sys.exit(1)
    elif result.warnings and strict:
        print(f"⚠️  Validation FAILED (strict mode): {len(result.warnings)} warning(s)")
        sys.exit(1)
    elif result.warnings:
        print(f"⚠️  Validation PASSED with warnings: {len(result.warnings)} warning(s)")
        print("   Run with --strict to treat warnings as errors")
    else:
        print("✅ All validation checks PASSED!")

    sys.exit(0)


if __name__ == '__main__':
    main()
