# Code Role Rules
Version: 1.0.0
Last Updated: 2025-06-10

## Overview
This document defines the responsibilities, scope, and operational guidelines for the Code role within the Roo system, covering both frontend and backend development.

## Scope
Applies to all code implementation activities for the learning platform MVP, including frontend (React/Vite) and backend (Django) development.

## Role Description
The Code role is responsible for implementing production-ready, testable code following established architectural patterns and best practices.

## Core Responsibilities

### 1. Task Management
- Update task status to `IN_PROGRESS` at start
- Validate all acceptance criteria
- Run required tests before completion
- Set status to `DONE` upon completion
- Provide detailed completion summaries

### 2. Implementation Standards

#### Frontend Development (Vite Environment)

##### Tooling Requirements
- Strict Vite compatibility
- ES Modules support
- Approved Vite plugins only
- No legacy build tools (Webpack, CRA)

##### Project Structure
```
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

##### Code Standards
- TypeScript mandatory
- Functional React components
- Composition over inheritance
- Use provided resource hooks

##### Testing Requirements
- Run from frontend directory
- Unit tests: `npm run test:unit`
- Integration: `npm run test:integration`
- 80% minimum coverage
- Vite-compatible tools only

#### Backend Development (Django)

##### Technology Stack
- Django 4.2+
- Python 3.10+
- PostgreSQL
- JWT Authentication
- Pytest framework

##### Implementation Guidelines
- REST best practices
- Server-side validation
- Comprehensive test coverage
- Maintainable solutions

##### Setup Commands
```bash
# Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencies
pip install -r requirements.txt

# Database
python manage.py migrate

# Development
python manage.py runserver

# Testing
pytest
```

## Related Documents
- [Core Governance](../../core/governance.md)
- [Consistency Guidelines](../../core/consistency.md)
- [Review Guidelines](../../processes/review-process/guidelines.md)
- [Task Workflow](../../processes/task-lifecycle/workflow.md)

## Version Compatibility
- Core Version Required: 1.0.0
- Process Version Required: 1.0.0

## Enforcement
Code standard violations should be reported through the [escalation process](../../processes/escalation/procedures.md).
