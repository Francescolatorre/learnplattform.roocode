---
description: Run all programmatic checks
allowed-tools: Bash(*), Read(*), TodoWrite(*)
---

Run all programmatic checks for the specified component.

**Target**: $ARGUMENTS (backend|frontend|all - defaults to all)

Execute comprehensive validation:
- **Backend**: pytest, black --check, pylint, flake8
- **Frontend**: npm run test:unit, npm run test:integration, npm run test:e2e, npm run lint, tsc --noEmit
- **All**: Both backend and frontend validations

Provides detailed output of all test results and validation status.