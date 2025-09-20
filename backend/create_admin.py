#!/usr/bin/env python
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User

# Create superuser if it doesn't exist
username = 'admin'
email = 'admin@learnplatform.dev'
password = 'AdminPass123!'

if not User.objects.filter(username=username).exists():
    admin_user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print(f'✅ Superuser created successfully!')
    print(f'   Username: {admin_user.username}')
    print(f'   Email: {admin_user.email}')
    print(f'   Role: {admin_user.role}')
    print(f'   Is Staff: {admin_user.is_staff}')
    print(f'   Is Superuser: {admin_user.is_superuser}')
else:
    existing_user = User.objects.get(username=username)
    print(f'⚠️  Admin user already exists!')
    print(f'   Username: {existing_user.username}')
    print(f'   Role: {existing_user.role}')