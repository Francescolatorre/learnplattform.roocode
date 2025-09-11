# Test Discovery Path Isolation Strategy

## Current Configuration Analysis
Current pytest.ini settings:
- pythonpath = backend/
- rootdir = backend/
- python_files = tests.py test_*.py *_tests.py

## Identified Issues
1. Broad Test Discovery
   - Current configuration searches entire backend directory
   - No path restrictions for test discovery
   - Multiple test file patterns allowed

2. Potential Problems
   - Risk of picking up unintended test files
   - No isolation between different types of tests
   - Possible import path conflicts

## Proposed Solution

### 1. Test Discovery Diagnostic Tool
Create a management command that will:
- Track which test files are discovered
- Record the import paths used
- Monitor test collection patterns
- Generate detailed discovery reports

### 2. Restricted Configuration
Implement a more restrictive pytest.ini:
```ini
[pytest]
DJANGO_SETTINGS_MODULE = learningplatform.settings
pythonpath = backend/
rootdir = backend/
testpaths = 
    backend/courses/tests
    backend/assessment/tests
    backend/users/tests
python_files = test_*.py
norecursedirs = migrations static templates
```

### 3. Validation Steps
1. Run test discovery diagnostic
2. Compare discovered tests with expected set
3. Verify import paths are correct
4. Confirm no unintended test collection

### 4. Success Metrics
- All intended tests discovered
- No unintended test collection
- Clear test discovery paths
- Predictable import resolution

## Implementation Plan

1. Phase 1: Analysis
   - Create test discovery diagnostic tool
   - Generate baseline discovery report
   - Document current test locations

2. Phase 2: Configuration
   - Implement restricted pytest.ini
   - Add explicit testpaths
   - Limit test file patterns

3. Phase 3: Validation
   - Run discovery diagnostic
   - Compare with baseline
   - Verify correct isolation

4. Phase 4: Documentation
   - Update test documentation
   - Document discovery patterns
   - Create test organization guide

## Expected Outcomes
1. Controlled test discovery
2. Predictable import paths
3. Clear test organization
4. Improved maintenance