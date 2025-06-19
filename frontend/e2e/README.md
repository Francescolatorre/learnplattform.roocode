# End-to-End Tests for Learning Platform

This directory contains end-to-end tests for the Learning Platform application using Playwright.

## Markdown Feature Tests

The learning platform supports Markdown rendering in course descriptions and learning task descriptions. Comprehensive tests have been implemented to verify this functionality.

### Test Files

- `markdown-course.spec.ts` - Tests for Markdown rendering in course descriptions
- `markdown-task.spec.ts` - Tests for Markdown rendering in learning task descriptions
- `markdown-editor.spec.ts` - Tests for the Markdown editor component functionality

### Running Markdown Tests

To run all Markdown-related tests:

```bash
npm run test:e2e:markdown
```

To run specific Markdown test files:

```bash
# Run only course markdown tests
npm run test:e2e:markdown:course

# Run only task markdown tests
npm run test:e2e:markdown:task

# Run only markdown editor tests
npm run test:e2e:markdown:editor
```

### Test Results and Analysis

The tests use two reporters:

1. Standard HTML reporter (results in `playwright-report/`)
2. Custom LLM-friendly Markdown reporter (results in `test-results/markdown-test-results.md`)

The LLM-friendly report provides a concise summary and detailed results that can be easily read and analyzed by developers or AI systems.

### What the Tests Verify

1. **Course Description Tests**

   - Markdown rendering in course creation and editing
   - Markdown preview in course lists
   - Proper sanitization of unsafe Markdown content

2. **Learning Task Tests**

   - Markdown rendering in task creation and editing
   - Markdown preview in task lists
   - Proper display of task descriptions to students

3. **Markdown Editor Tests**
   - Write/preview mode toggle functionality
   - Markdown help documentation
   - Basic editing operations

### Testing Utilities

The tests use helper utilities from:

- `utils/markdown-test-utils.ts` - Utilities for testing Markdown rendering
- `utils/auth-helpers.ts` - Authentication helpers for different user roles

### Common Test Patterns

The tests follow these common patterns:

1. Login as the appropriate user role (instructor/student)
2. Perform actions to create, edit, or view content with Markdown
3. Verify the Markdown is rendered correctly with expected HTML elements
4. Verify potentially unsafe content is properly sanitized

### Troubleshooting

If tests fail, check:

1. If selectors have changed (multiple selector fallbacks are included)
2. If authentication credentials are correct
3. If the application's route structure has changed
4. If Markdown rendering libraries have been updated

### Extending the Tests

When adding new Markdown features:

1. Add appropriate test cases to the relevant spec files
2. Update the `MarkdownTestUtils` class if needed
3. Ensure both success and error cases are covered
4. Run tests to validate your changes
