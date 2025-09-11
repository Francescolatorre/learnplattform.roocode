# Test Dependencies Implementation Plan

## Package Updates
Current requirements.txt needs the following changes:
1. Fix pytest-django line (remove appended 'pylint')
2. Add new packages with compatible versions:
   - factory-boy ~= 3.3.0
   - pytest-cov ~= 4.1.0

## Configuration Files
1. pytest.ini configuration:
```ini
[pytest]
DJANGO_SETTINGS_MODULE = learningplatform.settings_test
python_files = tests.py test_*.py *_tests.py
addopts = --cov=. --cov-report=html
```

2. .coveragerc configuration:
```ini
[run]
source = .
omit =
    */migrations/*
    */tests/*
    manage.py
    */wsgi.py
    */asgi.py
    */settings*.py

[report]
exclude_lines =
    pragma: no cover
    def __str__
    def __repr__
    raise NotImplementedError
    if __name__ == .__main__.:
    pass
    raise ImportError

[html]
directory = coverage_html
```

## Implementation Steps
1. Update requirements.txt with new packages
2. Create/update pytest.ini with Django settings and test patterns
3. Create .coveragerc with proper source and exclusion settings
4. Verify installation and configuration

## Validation Plan
1. Package Installation:
   - Run `pip install -r requirements.txt`
   - Verify with `pip freeze`

2. Pytest Configuration:
   - Run `pytest --collect-only` to verify test discovery
   - Check Django settings integration

3. Coverage Setup:
   - Run `pytest` with coverage
   - Verify HTML report generation

## Error Handling
- Package conflicts: Review and adjust versions
- Django settings: Ensure settings_test.py exists and is properly configured
- Coverage paths: Verify source directory structure matches configuration