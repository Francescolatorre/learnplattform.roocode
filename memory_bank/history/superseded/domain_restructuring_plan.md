# Domain Restructuring Implementation Plan

## Phase 1: Setup and Preparation
1. Create git branch
```bash
git checkout -b feature/domain-restructuring
```

2. Create new app structure
```bash
python manage.py startapp learning
python manage.py startapp tasks
```

## Phase 2: Tasks App Creation
1. Create base Task model in tasks/models.py
```python
class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

2. Create specialized task types
```python
class LearningTask(Task):
    pass

class AssessmentTask(Task):
    max_score = models.DecimalField(max_digits=5, decimal_places=2)

class QuizTask(AssessmentTask):
    time_limit = models.IntegerField(null=True)  # in minutes
```

## Phase 3: Learning App Migration
1. Move Course model from courses to learning
2. Update Course model to use new Task types
3. Create data migration to preserve existing data
4. Update all imports to use new location

## Phase 4: Assessment App Restructuring
1. Update Submission model to use new Task types
2. Merge quiz functionality into assessment app
3. Create data migration for assessment models
4. Update UserProgress to handle new structure

## Phase 5: Cleanup
1. Remove deprecated apps:
   - courses
   - learningunits
   - quizzes

2. Update settings.py:
```python
INSTALLED_APPS = [
    ...
    'learning',
    'tasks',
    'assessment',
    ...
]
```

## Phase 6: Testing
1. Update test files for new structure
2. Add new tests for task inheritance
3. Run full test suite
4. Fix any broken tests

## Phase 7: Documentation
1. Update API documentation
2. Document new model relationships
3. Update developer setup guide

## Git Commits Plan

1. Initial restructuring setup
```bash
git add .
git commit -m "feat: Initialize new app structure for domain restructuring"
```

2. Tasks app implementation
```bash
git add tasks/
git commit -m "feat: Add tasks app with base and specialized task models"
```

3. Learning app migration
```bash
git add learning/
git commit -m "feat: Migrate course functionality to learning app"
```

4. Assessment restructuring
```bash
git add assessment/
git commit -m "feat: Restructure assessment app with unified quiz handling"
```

5. Cleanup and settings
```bash
git add .
git commit -m "chore: Remove deprecated apps and update settings"
```

6. Test updates
```bash
git add */tests
git commit -m "test: Update test suite for new domain structure"
```

7. Documentation
```bash
git add docs/
git commit -m "docs: Update documentation for domain restructuring"
```

## Final Steps
1. Review all changes
2. Run final test suite
3. Push to remote:
```bash
git push origin feature/domain-restructuring
```

4. Create pull request with detailed description of changes

## Rollback Plan
If issues are encountered:
1. Document specific failure point
2. Revert to previous commit
3. Address issues in smaller increments

## Success Criteria
- All tests passing
- No circular imports
- Clear domain boundaries
- Simplified dependency structure
- Preserved data integrity
- Updated documentation