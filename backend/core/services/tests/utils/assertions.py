"""
Custom assertions for service layer testing.
"""
from decimal import Decimal
from typing import Any, List, Dict, Optional
from django.db.models import Model
from django.db import transaction

def assert_business_rules(
    result: Any,
    expected_state: Dict[str, Any],
    message: Optional[str] = None
) -> None:
    """
    Verifies that business rules were properly applied.

    Args:
        result: The object to check
        expected_state: Dictionary of attribute-value pairs to verify
        message: Optional custom assertion message
    """
    for attr, expected in expected_state.items():
        actual = getattr(result, attr)
        assert actual == expected, (
            message or f"Business rule violation: {attr} is {actual}, expected {expected}"
        )

def assert_transaction_handling(
    method_call: callable,
    *args,
    **kwargs
) -> Any:
    """
    Verifies that a method properly handles transactions.

    Args:
        method_call: Callable to execute
        *args: Positional arguments for the method
        **kwargs: Keyword arguments for the method

    Returns:
        Result of the method call
    """
    with transaction.atomic():
        sid = transaction.savepoint()
        try:
            result = method_call(*args, **kwargs)
            transaction.savepoint_commit(sid)
            return result
        except Exception as e:
            transaction.savepoint_rollback(sid)
            raise e

def assert_permission_handling(
    method_call: callable,
    user: Model,
    expected_permission: str,
    *args,
    **kwargs
) -> None:
    """
    Verifies that a method properly checks permissions.

    Args:
        method_call: Callable to execute
        user: User model instance
        expected_permission: Permission that should be checked
        *args: Positional arguments for the method
        **kwargs: Keyword arguments for the method
    """
    # Track permission checks
    checked_permissions = []
    original_has_perm = user.has_perm

    def mock_has_perm(perm):
        checked_permissions.append(perm)
        return original_has_perm(perm)

    user.has_perm = mock_has_perm

    try:
        method_call(*args, **kwargs)
    finally:
        user.has_perm = original_has_perm

    assert expected_permission in checked_permissions, (
        f"Permission {expected_permission} was not checked"
    )

def assert_query_efficiency(
    method_call: callable,
    max_queries: int,
    *args,
    **kwargs
) -> None:
    """
    Verifies that a method executes within a query budget.

    Args:
        method_call: Callable to execute
        max_queries: Maximum number of allowed queries
        *args: Positional arguments for the method
        **kwargs: Keyword arguments for the method
    """
    from django.db import connection
    from django.test.utils import CaptureQueriesContext

    with CaptureQueriesContext(connection) as context:
        method_call(*args, **kwargs)

    query_count = len(context.captured_queries)
    assert query_count <= max_queries, (
        f"Query budget exceeded: executed {query_count} queries, maximum allowed is {max_queries}"
    )

def assert_error_handling(
    method_call: callable,
    expected_error: Exception,
    *args,
    error_message: Optional[str] = None,
    **kwargs
) -> None:
    """
    Verifies that a method properly handles errors.

    Args:
        method_call: Callable to execute
        expected_error: Expected exception class
        *args: Positional arguments for the method
        error_message: Optional expected error message
        **kwargs: Keyword arguments for the method
    """
    try:
        method_call(*args, **kwargs)
        assert False, f"Expected {expected_error.__name__} was not raised"
    except expected_error as e:
        if error_message:
            assert str(e) == error_message, (
                f"Error message mismatch: got '{str(e)}', expected '{error_message}'"
            )

def assert_model_state(
    model_instance: Model,
    expected_values: Dict[str, Any],
    exclude_fields: Optional[List[str]] = None
) -> None:
    """
    Verifies that a model instance has the expected state.

    Args:
        model_instance: The model instance to check
        expected_values: Dictionary of field-value pairs to verify
        exclude_fields: Optional list of fields to ignore
    """
    exclude_fields = exclude_fields or []

    for field, expected in expected_values.items():
        if field not in exclude_fields:
            actual = getattr(model_instance, field)
            if isinstance(expected, Decimal):
                assert Decimal(str(actual)) == expected, (
                    f"Field {field} is {actual}, expected {expected}"
                )
            else:
                assert actual == expected, (
                    f"Field {field} is {actual}, expected {expected}"
                )

def assert_service_integration(
    service_method: callable,
    repository_method: str,
    expected_args: tuple,
    expected_kwargs: Dict[str, Any],
    *args,
    **kwargs
) -> None:
    """
    Verifies proper integration between service and repository.

    Args:
        service_method: Service method to test
        repository_method: Name of repository method that should be called
        expected_args: Expected positional arguments
        expected_kwargs: Expected keyword arguments
        *args: Actual positional arguments for service method
        **kwargs: Actual keyword arguments for service method
    """
    service = service_method.__self__
    repository = service.repository

    # Track repository method calls
    original_method = getattr(repository, repository_method)
    calls = []

    def mock_method(*args, **kwargs):
        calls.append((args, kwargs))
        return original_method(*args, **kwargs)

    setattr(repository, repository_method, mock_method)

    try:
        service_method(*args, **kwargs)
    finally:
        setattr(repository, repository_method, original_method)

    assert len(calls) > 0, f"Repository method {repository_method} was not called"
    actual_args, actual_kwargs = calls[0]

    assert actual_args == expected_args, (
        f"Repository method args mismatch: got {actual_args}, expected {expected_args}"
    )
    assert actual_kwargs == expected_kwargs, (
        f"Repository method kwargs mismatch: got {actual_kwargs}, expected {expected_kwargs}"
    )
