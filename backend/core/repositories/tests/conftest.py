"""
Repository layer test configuration and fixtures.
"""
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.db import transaction

from core.tests.factories import AdminFactory, UserFactory

User = get_user_model()

@pytest.fixture(scope='function')
def test_user(db):
    """
    Creates a test user in the database.
    Uses UserFactory with transaction handling.
    """
    with transaction.atomic():
        return UserFactory.create()

@pytest.fixture(scope='function')
def test_admin(db):
    """
    Creates a test admin user in the database.
    Uses AdminFactory with transaction handling.
    """
    with transaction.atomic():
        return AdminFactory.create()

@pytest.fixture(scope='function')
def transactional_db_setup(db):
    """
    Provides a clean database state with transaction support.
    Rolls back changes after each test.
    """
    with transaction.atomic():
        yield

@pytest.fixture(scope='function')
def db_user_batch(db):
    """
    Creates a batch of test users.
    Useful for testing queries with multiple records.
    """
    with transaction.atomic():
        return UserFactory.create_batch(size=5)

@pytest.fixture(scope='function')
def test_transaction(db):
    """
    Provides a transaction context for testing atomic operations.
    Automatically rolls back all changes.
    """
    with transaction.atomic():
        sid = transaction.savepoint()
        yield
        transaction.savepoint_rollback(sid)

@pytest.fixture(scope='function')
def nested_transaction(db):
    """
    Provides nested transaction support for complex operations.
    Useful for testing transaction isolation and rollback scenarios.
    """
    with transaction.atomic():
        sid1 = transaction.savepoint()
        with transaction.atomic():
            sid2 = transaction.savepoint()
            yield (sid1, sid2)
            transaction.savepoint_rollback(sid2)
        transaction.savepoint_rollback(sid1)

@pytest.fixture(scope='function')
def db_cleanup(db):
    """
    Ensures database cleanup after tests.
    Use this fixture when test_transaction is not sufficient.
    """
    yield
    User.objects.all().delete()  # Add other model cleanups as needed

@pytest.fixture(scope='function')
def isolation_level(db):
    """
    Sets database isolation level for testing.
    Useful for testing concurrent access scenarios.
    """
    from django.db import connection
    
    original_level = connection.isolation_level
    connection.isolation_level = None  # Read Committed by default
    yield connection
    connection.isolation_level = original_level