'''
Dieses Modul enthält die Einstellungen für die Testumgebung.
'''

from .settings import (
    INSTALLED_APPS,
    MIDDLEWARE,
    DEBUG,
    SECRET_KEY
)

TESTING = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'test_db',
        'USER': 'lp_dev',
        'PASSWORD': 'lp',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Deaktiviere Caches oder Middleware, falls nötig
DEBUG = False  # Override DEBUG for tests