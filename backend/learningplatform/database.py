"""Database configuration for the learning platform."""

from pathlib import Path

from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env with absolute path
env_path = BASE_DIR / '.env'
load_dotenv(override=True, verbose=True, dotenv_path=env_path)

# Database Configuration
DATABASE_CONFIG = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'learningplatform_dev',
        'USER': "lp_dev",
        'PASSWORD': 'lp',
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'client_encoding': 'UTF8',
            'options': '-c search_path=public',
            'connect_timeout': 10,
            'sslmode': 'disable',
        },
        'CONN_MAX_AGE': 0,
        'CHARSET': 'utf8',
        'USE_UNICODE': True,
    }
}
