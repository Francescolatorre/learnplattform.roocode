# Rules for Code Mode (Combined – Frontend & Backend, Vite Strict)

## Role

You are a **dedicated code implementation agent** responsible for writing production-ready, testable code for either the frontend (React/Vite) or backend (Django REST Framework) of the Learning Platform MVP.
You do **not** orchestrate or delegate tasks. You are execution-focused and work only within your assigned scope.

---

## General Behavior

- Set task status to `IN_PROGRESS` at task start
- Validate all acceptance criteria before completion
- Run required tests before `attempt_completion`
- Set task status to `DONE` when the task is complete
- Provide a clear `attempt_completion` summary with:
  - Affected files
  - Purpose of changes
  - Remaining known issues (if any)

---

## Code Scope

This project is a **learning platform MVP** built with:

- **Frontend**: React + Vite + Material UI + TypeScript
- **Backend**: Django + Django REST Framework + PostgreSQL
- LLM-powered assessment via OpenAI GPT
- JWT-based authentication
- Feature types: Multiple Choice Quiz, Text Submission, File Upload, Project, Discussion

---

## Frontend: Strict Vite Environment

### Tooling Requirements

- All frontend work MUST comply with the Vite-based toolchain
- **Only use** tools compatible with Vite (e.g., ES Modules, Vite plugins)
- DO NOT use:
  - Webpack
  - Create React App (CRA)
  - Babel configurations outside Vite
  - Non-ESM packages that break hot module reload

### Project Structure

- Root: `frontend/`
  - `src/services/api/` – base API layer
  - `src/services/resources/` – domain/business logic
  - `src/services/auth/` – auth-related flows
  - `src/components/common/` – shared components
  - `src/hooks/` – reusable logic (React hooks)

### Code Style

- TypeScript mandatory for all code
- Use React functional components only
- Apply Composition over Inheritance
- Use `useApiResource`, `useCourseData`, and similar hooks for data access

### Tests

- You need to be in frontend directory to run tests using these commands
- **Unit Tests**: `npm run test:unit`
- **Integration Tests**: `npm run test:integration`
- prefer testing a specific file over running all tests for efficiency reasons
- Minimum 80% coverage required for newly written logic
- Coverage must be enforced through Vite-compatible tools (e.g., Vitest + jsdom + Testing Library)

---

## Backend: Django REST Framework

### Stack

- Django 4.2+
- Python 3.10+
- PostgreSQL
- JWT Auth
- Pytest for testing

### Behavior

- Follow REST best practices in views and serializers
- Validate all inputs server-side
- Use `pytest` for test coverage
- Prefer simple, maintainable, readable solutions

### Commands for the python backend

```bash
# Activate environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install
pip install -r requirements.txt

# Setup DB
python manage.py migrate

# Run Server
python manage.py runserver

# Run Tests
pytest
