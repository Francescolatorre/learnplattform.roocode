<<<<<<< HEAD
# Learning Platform MVP

## Project Overview

A learning platform with LLM-powered assessment, built using Django REST Framework and React.

## Technology Stack

- **Backend**: Django, Django REST Framework
- **Frontend**: React, Material UI
- **Database**: PostgreSQL
- **Authentication**: JWT
- **LLM Integration**: OpenAI GPT

## Developer Documentation

- [Migration Guide: Updating Legacy TypeScript Services](memory_bank/docs/typescript_service_migration.md)

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

## Backend Setup

### Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Environment Configuration

1. Copy `.env.example` to `.env`
2. Update database and OpenAI credentials

### Database Setup

```bash
python manage.py migrate
```

### Run Development Server

```bash
python manage.py runserver
```

## API Endpoints

### Health Check

- **URL**: `/api/core/health/`
- **Method**: GET
- **Description**: Returns system and application health status
- **Response**:

  ```json
  {
    "status": "healthy",
    "system": {
      "python_version": "3.10.0",
      "django_version": "4.2.x",
      "platform": "Windows-10",
      "cpu_usage": 10.5,
      "memory_usage": 45.2
    },
    "database": {
      "status": "connected"
    }
  }
  ```

## Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

## Development Workflow

- Feature branch development
- Pytest for backend testing
- Jest for frontend testing
- Linting with flake8 and ESLint

## MVP Features

- Free tutorials
- LLM-powered assessment
- Basic user management
- Course submissions
- **Multiple Choice Quiz Task Type**
  - Configurable quiz with randomization options
  - Flexible scoring mechanism
  - Detailed submission tracking
  - Support for single and multiple correct answers
  - Attempt limit configuration

## Task Types Supported

- Text Submission
- Multiple Choice Quiz
- File Upload
- Project
- Discussion

## Quiz Configuration Features

- Total questions configuration
- Points per question
- Maximum attempts
- Question randomization
- Option randomization
- Detailed submission results

## YAGNI Considerations

- No premium features
- No complex deployment
- No microservices
- No advanced caching

## License

MIT License
=======
# Roo Code Modules Documentation
Version: 1.0.0
Last Updated: 2025-06-10

## Project Overview
The Roo code modules system is a sophisticated governance framework that manages and coordinates different roles, processes, and tasks within the learning platform codebase. This documentation serves as the central reference point for understanding how the various components work together.

## Directory Structure

```
├── rules/                    # Core governance rules and processes
│   ├── core/                # Core governance principles
│   │   ├── consistency.md   # Consistency guidelines
│   │   ├── governance.md    # Fundamental governance principles
│   │   ├── inconsistency_resolution.md  # Handling inconsistencies
│   │   └── versioning.md    # Version control standards
│   ├── modes/               # Mode-specific guidelines
│   │   ├── code.md         # Code mode specifications
│   │   └── digital-design.md # Digital Design mode standards
│   ├── processes/          # Process documentation
│   │   ├── escalation.md   # Escalation procedures
│   │   ├── review-process.md # Review guidelines
│   │   └── task-lifecycle.md # Task workflow management
│   └── rules-*/            # Role-specific rule sets
├── rules-architect/        # Architect role guidelines
├── rules-code/            # Code role specifications
├── rules-debug/           # Debug role protocols
├── rules-digitaldesign/   # Digital Design role standards
├── snippets/             # Reusable content templates
│   ├── rule-templates.md # Templates for rule creation
│   ├── subtask_governance_rules.md # Subtask guidelines
│   └── task-template.md  # Task documentation templates
└── templates/            # Project templates
    ├── project_status_template.md # Project status reporting
    └── task_template.md  # Task documentation format
```

## Rule Hierarchy and Precedence

1. **Core Rules** (`rules/core/*.md`)
   - Establish fundamental governance principles
   - Define system-wide standards
   - Take precedence over role-specific rules
   - Must be followed by all roles and processes

2. **Role-Based Rules** (`rules-*/rules.md`)
   - Define role-specific responsibilities
   - Outline operational boundaries
   - Must align with core governance principles
   - Include role-specific workflows and standards

3. **Process Rules** (`rules/processes/*.md`)
   - Define workflows and procedures
   - Establish cross-role interactions
   - Detail escalation paths
   - Specify validation requirements

## How to Use This Repository

1. Start with `rules/core/governance.md` to understand fundamental principles
2. Review your role-specific rules in `rules-<your-role>/rules.md`
3. Follow task lifecycle documentation in `rules/processes/task-lifecycle.md`
4. Reference process-specific guidelines as needed
5. Use escalation procedures when encountering blockers

## Version Control Guidelines

1. All rule documents follow semantic versioning (MAJOR.MINOR.PATCH)
2. Version compatibility is checked across related documents
3. Changes must maintain cross-document consistency
4. Version updates require architectural review
5. Documentation must be updated with code changes

## Quick Start Guide

1. **For New Tasks**
   - Check task state definitions in `rules/processes/task-lifecycle.md`
   - Use templates from `templates/task_template.md`
   - Follow role-specific task handling procedures
   - Ensure all required documentation is completed

2. **For Existing Tasks**
   - Review current task status
   - Follow role transition protocols
   - Update documentation as you progress
   - Maintain task state consistency

3. **For Issue Resolution**
   - Follow escalation procedures in `rules/processes/escalation.md`
   - Document all decisions and changes
   - Update relevant documentation
   - Ensure proper handoff between roles

## Contributing Guidelines

1. **Documentation Updates**
   - Follow templates in `snippets/rule-templates.md`
   - Maintain cross-references between related documents
   - Include version information
   - Update all affected documents together

2. **Rule Changes**
   - Propose changes through established channels
   - Include impact analysis
   - Maintain backwards compatibility where possible
   - Follow versioning guidelines

3. **Quality Standards**
   - Clear and concise documentation
   - Consistent formatting
   - Updated cross-references
   - Complete version information

4. **Review Requirements**
   - Technical accuracy
   - Consistency with existing rules
   - Clear and understandable content
   - Proper cross-referencing

## Related Core Documents

- [Core Governance](rules/core/governance.md)
- [Consistency Guidelines](rules/core/consistency.md)
- [Versioning Strategy](rules/core/versioning.md)
- [Inconsistency Resolution](rules/core/inconsistency_resolution.md)

## Role-Specific Rules

- [Architect Rules](rules-architect/rules.md)
- [Code Rules](rules-code/rules.md)
- [Debug Rules](rules-debug/rules.md)
- [Digital Design Rules](rules-digitaldesign/rules.md)

## Process Documentation

- [Task Lifecycle](rules/processes/task-lifecycle.md)
- [Review Process](rules/processes/review-process.md)
- [Escalation Procedures](rules/processes/escalation.md)

## Templates and Snippets

- [Task Template](templates/task_template.md)
- [Project Status Template](templates/project_status_template.md)
- [Rule Templates](snippets/rule-templates.md)
- [Subtask Governance](snippets/subtask_governance_rules.md)
>>>>>>> 47d36b38935d9669388785e2f378c050a0881258
