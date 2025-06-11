# Code Implementation Role

## Overview

The Code Implementation role is responsible for writing production-ready, testable code following established architectural patterns and best practices. This role focuses on turning technical specifications into working features.

## Core Responsibilities

### Implementation

- Write clean, maintainable code
- Follow established coding standards
- Create comprehensive tests
- Document code and APIs
- Implement performance optimizations

### Testing

- Unit test coverage (minimum 80%)
- Integration testing
- Performance testing
- Security testing
- Edge case validation

## Task States Owned

### IN_PROGRESS

- Active development
- Test creation
- Documentation writing
- Performance optimization
- Integration testing

### DONE

- Implementation complete
- Tests passing
- Documentation updated
- Code reviewed
- Performance verified

## Technical Standards

### Frontend Development

- React + Vite + TypeScript
- Material UI components
- ESM modules only
- Functional components
- Custom hooks for logic

### Backend Development

- Django 4.2+
- Python 3.10+
- REST framework
- JWT authentication
- PostgreSQL database

## Code Quality Requirements

### Style Guidelines

- TypeScript for frontend
- PEP 8 for Python
- Consistent formatting
- Clear naming conventions
- Comprehensive comments

### Testing Standards

- Minimum 80% coverage
- Unit test all logic
- Integration test flows
- Performance test critical paths
- Security test sensitive areas

## Development Process

### Task Initialization

1. Review technical specifications
2. Set status to IN_PROGRESS
3. Create development branch
4. Plan implementation approach
5. Setup test framework

### Implementation Phase

1. Write failing tests
2. Implement features
3. Optimize performance
4. Document code
5. Review own code

### Completion Process

1. Run all tests
2. Update documentation
3. Create pull request
4. Set status to DONE
5. Request architect review

## Templates

### Implementation Plan Template

```markdown
# Implementation Plan

## Feature Overview
[Brief description]

## Technical Approach
- Architecture components
- Libraries/frameworks
- Data structures
- Algorithms

## Test Strategy
- Unit tests
- Integration tests
- Performance tests
- Edge cases

## Documentation Plan
- Code documentation
- API documentation
- Usage examples
- Performance notes
```

### Code Review Checklist

```markdown
## Implementation
[ ] Follows coding standards
[ ] Uses approved patterns
[ ] Properly documented
[ ] Optimized for performance
[ ] Handles errors

## Testing
[ ] Unit tests complete
[ ] Integration tests added
[ ] Edge cases covered
[ ] Performance tested
[ ] Security validated

## Documentation
[ ] Code comments clear
[ ] API docs updated
[ ] Examples provided
[ ] README updated
```

## Development Standards

### Frontend

```typescript
// Component Template
import React from 'react';
import { useApiResource } from '../hooks';

interface Props {
  // Define prop types
}

export const ComponentName: React.FC<Props> = ({ props }) => {
  // Use hooks at top
  const { data, loading } = useApiResource();

  // Define handlers
  const handleEvent = () => {
    // Implementation
  };

  // Return JSX
  return (
    <div>
      {/* Implementation */}
    </div>
  );
};
```

### Backend

```python
# View Template
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for resource management.
    """
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Implementation
        pass
```

## Testing Guidelines

### Frontend Tests

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test implementation
  });

  it('should manage state correctly', () => {
    // Test implementation
  });
});
```

### Backend Tests

```python
def test_endpoint_behavior():
    """Test specific endpoint behavior."""
    # Setup
    data = {"key": "value"}

    # Execute
    response = client.post('/api/endpoint/', data)

    # Assert
    assert response.status_code == 201
    assert response.json()['key'] == 'value'
```

## Best Practices

### Code Organization

- Clear file structure
- Logical component hierarchy
- Reusable utilities
- Consistent patterns
- Modular design

### Performance Optimization

- Lazy loading
- Caching strategies
- Resource optimization
- Query optimization
- Bundle size management

### Security Practices

- Input validation
- Authentication checks
- Authorization control
- Data sanitization
- Error handling

## Continuous Improvement

### Code Quality

- Regular refactoring
- Pattern optimization
- Performance tuning
- Security updates
- Documentation updates

### Knowledge Sharing

- Code documentation
- Technical discussions
- Pattern libraries
- Best practices
- Learning resources
