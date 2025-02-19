# Pytest @pytest.mark.tryfirst Deprecation

## Background
The `@pytest.mark.tryfirst` decorator has been deprecated in recent versions of pytest. This decorator was previously used to indicate that a hook implementation should be called as early as possible during the pytest plugin lifecycle.

## Replacement
The recommended replacement is to use `@pytest.hookimpl(tryfirst=True)` instead. This new approach provides a more explicit and standardized way to specify hook priority.

## Migration Steps
1. Replace all instances of `@pytest.mark.tryfirst` with `@pytest.hookimpl(tryfirst=True)`
2. Ensure the import is correct: `import pytest`

## Example

### Old (Deprecated) Syntax:
```python
@pytest.mark.tryfirst
def pytest_configure(config):
    # Hook implementation
    pass
```

### New Recommended Syntax:
```python
@pytest.hookimpl(tryfirst=True)
def pytest_configure(config):
    # Hook implementation
    pass
```

## Rationale
The change to `@pytest.hookimpl(tryfirst=True)` provides:
- More consistent hook implementation syntax
- Clearer indication of hook behavior
- Better alignment with pytest's plugin architecture

## Compatibility
This change is part of pytest's ongoing efforts to standardize and improve plugin hook management.