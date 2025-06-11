# Core Governance Rules

This document outlines the fundamental governance rules for the Learning Platform project.

## Memory Bank Governance

### Read Strategy

- Initial execution requires reading `activeContext.md`
- For active tasks, read only necessary supporting files
- When no active task exists:
  1. Check `project_status.md`
  2. If no tasks are in progress, await input

### Consistency Protocol

- Compare `activeContext.md` with `project_status.md`
- Stop immediately if inconsistencies are found
- Follow `inconsistency_resolution.md` steps
- Escalate unresolved issues to Architect Mode

## Task Management Lifecycle

### Task States

| Status       | Role           | Description                                               |
|--------------|----------------|-----------------------------------------------------------|
| `DRAFT`      | Digital Design | Initial requirements and user stories                     |
| `VALIDATED`  | Digital Design | Verified business alignment and completeness              |
| `TODO`       | Architect      | Technical planning and resource allocation                |
| `IN_PROGRESS`| Code          | Active implementation and monitoring                      |
| `DONE`       | Code          | Implementation complete, ready for review                 |
| `REVIEW`     | Architect     | Quality assessment and feedback                           |

### Review Criteria

- **Completeness**: All requirements addressed
- **Clarity**: Clear documentation and implementation
- **Resources**: Adequate allocation and availability
- **Risk Assessment**: Identified and mitigated
- **Business Alignment**: Meets strategic goals

### Task Prioritization

1. Critical path items take precedence
2. Dependencies must be resolved first
3. Regular reassessment of postponed tasks
4. Consider technical constraints and complexity

## Role Switching Protocol

| From → To           | Purpose                                              |
|--------------------|----------------------------------------------------|
| Digital Design → Architect | Requirements validation and technical planning       |
| Architect → Code    | Task definition and implementation guidance          |
| Code → Architect    | Implementation review and validation                 |
| Debug ↔ Code        | Issue resolution and fixes                          |
| Any → Emergency     | Critical issue handling                             |

## Status Updates

### Required Information

- Timestamp of update
- Reason for status change
- Knowledge summary or blockers
- Validation status (for completed tasks)

### Status Types

- `DRAFT`: Initial task creation
- `VALIDATED`: Requirements verified
- `TODO`: Ready for implementation
- `IN_PROGRESS`: Active development
- `DONE`: Implementation complete
- `POSTPONED`: Temporarily delayed

## Git Commit Standards

### Commit Message Format

```
[TASK-ID] [STATUS] [SUMMARY]
```

### Required Elements

1. Task identifier
2. Current status
3. Change summary
4. Validation status (when applicable)

### Best Practices

- Stage related files together
- Squash minor commits
- Use proper merge commit format
- Include relevant task references

## Language-Specific Guidelines

### Python/Django

- Follow `python_django_rules.yaml` specifications
- Maintain consistent code style
- Ensure proper test coverage
- Document API endpoints

### React/TypeScript

- Adhere to `react_typescript_rules.yaml`
- Use functional components
- Maintain type safety
- Follow hook usage guidelines

## Automation Requirements

### Automated Processes

- Status synchronization
- Deadline tracking
- Quality checks
- Documentation updates

### Quality Gates

- Code review completion
- Test coverage requirements
- Documentation standards
- Performance benchmarks

## Documentation Standards

### Required Sections

1. Overview
2. Implementation details
3. Testing approach
4. Deployment considerations
5. Maintenance guidelines

### Update Procedures

- Regular review cycles
- Version control
- Change documentation
- Impact assessment

## Emergency Procedures

### Criteria

- System stability issues
- Security vulnerabilities
- Critical business impact
- Data integrity concerns

### Response Protocol

1. Issue identification
2. Impact assessment
3. Immediate action plan
4. Stakeholder communication
5. Resolution implementation
6. Post-mortem analysis
