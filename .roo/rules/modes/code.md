# Code Role Rules
Version: 1.0.0
Last Updated: 2025-06-10

## Overview
This document defines the responsibilities, scope, and operational guidelines for the Code role within the Roo system, covering both frontend and backend development.

## Scope
Applies to all code implementation activities for the learning platform MVP, including frontend (React/Vite) and backend (Django) development.

## Core Responsibilities
Last Updated: 2025-06-10

### 1. Implementation Standards
- Maintain code quality
- Follow best practices
- Use approved patterns
- Document changes
- Optimize performance

### 2. Testing Requirements 
- Write unit tests
- Create integration tests
- Maintain coverage standards
- Validate edge cases
- Performance testing

### 3. Documentation
- Code documentation
- API documentation
- Implementation notes
- Usage examples
- Change history

## Frontend Development (Vite)
Last Updated: 2025-06-10

### Technology Stack
- React 18.0+
- Vite 5.0+
- TypeScript 5.0+
- Material UI 5.0+
- ES Modules only

### Project Structure
```bash
frontend/
├── src/
│   ├── services/
│   │   ├── api/      # Base API layer
│   │   ├── resources/# Domain logic
│   │   └── auth/     # Authentication
│   ├── components/
│   │   └── common/   # Shared components
│   └── hooks/        # React hooks
```

### Testing Standards
- Test Runner: Vitest 1.0+
- Coverage: 80% minimum
- Unit Tests: `npm run test:unit`
- Integration: `npm run test:integration`
- E2E: Playwright 1.0+

## Backend Development (Django)
Last Updated: 2025-06-10

### Technology Stack
- Django 4.2+
- Python 3.10+
- PostgreSQL 14+
- JWT Authentication
- Pytest 7.0+

### Implementation Guidelines
- REST best practices
- Server-side validation
- Comprehensive testing
- Performance optimization
- Security standards

## Version Compatibility
- Core Version Required: 1.0.0
- Process Version Required: 1.0.0
- Frontend Dependencies:
  - Node.js >= 18.0.0
  - npm >= 9.0.0
- Backend Dependencies:
  - Python >= 3.10.0
  - PostgreSQL >= 14.0.0

## Related Documents
- [Core Governance](../../core/governance.md)
- [Consistency Guidelines](../../core/consistency.md)
- [Task Workflow](../../processes/task-lifecycle/workflow.md)
- [Review Guidelines](../../processes/review-process/guidelines.md)
- [Escalation Procedures](../../processes/escalation/procedures.md)

## Changelog
### 1.0.0 (2025-06-10)
- Initial version
- Frontend (Vite) specifications
- Backend (Django) requirements
- Testing standards
- Documentation guidelines
- Version compatibility matrix

## Enforcement
Code standard violations should be reported through the [escalation process](../../processes/escalation/procedures.md).
