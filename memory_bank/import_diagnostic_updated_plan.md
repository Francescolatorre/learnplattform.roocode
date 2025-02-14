# Updated Import Diagnostic Plan

## Critical Issues Identified
1. Model Registration Conflict
   - Duplicate `Submission` models in:
     a. `assessment.models`
     b. `backend.assessment.models`

2. PYTHONPATH Complexity
   - Multiple overlapping paths
   - Potential import resolution ambiguity

## Revised Action Plan

### Immediate Actions
1. Resolve Model Registration Conflict
   - Investigate duplicate `Submission` model definitions
   - Determine correct location for model
   - Remove or consolidate duplicate model
   - Update import statements accordingly

2. PYTHONPATH Standardization
   - Simplify PYTHONPATH configuration
   - Remove redundant paths
   - Establish clear import hierarchy

### Detailed Steps
1. Model Conflict Resolution
   - [ ] Compare `assessment/models.py` and `backend/assessment/models.py`
   - [ ] Identify differences in `Submission` model
   - [ ] Choose canonical model location
   - [ ] Remove or merge duplicate model
   - [ ] Update all related imports

2. Import Statement Audit
   - [ ] Scan all test files for import patterns
   - [ ] Convert to absolute imports
   - [ ] Remove any relative imports
   - [ ] Ensure consistent import resolution

3. PYTHONPATH Optimization
   - [ ] Remove unnecessary paths
   - [ ] Verify Django app configuration
   - [ ] Update `pytest.ini` and `settings.py`

4. Validation
   - [ ] Re-run test discovery
   - [ ] Verify no import or model registration errors
   - [ ] Confirm all tests can be collected

## Potential Root Causes
- Inconsistent project structure
- Multiple app or package definitions
- Unclear module boundaries

## Recommended Tools
- `python -m pip list` (check installed packages)
- `python -m site` (verify site-packages configuration)
- Django management commands for app verification