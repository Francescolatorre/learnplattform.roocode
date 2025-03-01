import pytest
from django.conf import settings


@pytest.fixture(autouse=True)
def setup_test_environment():
    settings.DEBUG = True
    settings.DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
