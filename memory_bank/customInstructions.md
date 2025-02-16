# Roo Project Guidelines

## Documentation Requirements

### Memory Bank Maintenance
1. Required Documentation Files:
   - productContext.md - Vision and requirements
   - systemPatterns.md - Architecture patterns
   - techContext.md - Technology stack
   - progress.md - Implementation status
   - activeContext.md - Current work tracking

2. Active Context Management
   - ALWAYS maintain activeContext.md across all modes
   - Update for every significant change or task
   - Include:
     * Current work being performed
     * Recent changes made
     * Next steps planned
   - Keep synchronized with actual project state

## General Task Completion Rules

### Test Validation
1. Before ending any task, ALWAYS run and verify all relevant tests:
   - Backend tests (pytest)
   - Frontend tests (Vitest)
   - Ensure 100% test pass rate
   - If any tests fail, diagnose and fix before task completion

### Test Validation Workflow
- Run backend tests: `python -m pytest`
- Run frontend tests: `npm run test`
- Verify test coverage
- Address any test failures immediately
- Refactor code to pass all tests
- Document any test-related changes

### Continuous Integration Principles
- Tests are a critical part of task completion
- No task is considered complete until ALL tests pass
- Maintain high test coverage
- Prioritize test-driven development

### Reporting
- If tests fail, provide:
  1. Detailed error messages
  2. Potential root causes
  3. Proposed fixes

## Exceptions
- Rare cases may require manual override
- Always document and justify any test bypassing

## Best Practices
- Write tests alongside feature implementation
- Keep tests simple, focused, and maintainable
- Use meaningful test descriptions
- Cover edge cases and error scenarios
- Keep documentation up-to-date with changes