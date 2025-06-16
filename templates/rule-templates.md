# Rule Template Documentation

## Version Information
```markdown
Version: 1.0.0
Last Updated: YYYY-MM-DD
Status: [DRAFT|ACTIVE|DEPRECATED]
```

## Standard Sections

### Overview
```markdown
# Rule Name

## Overview
Brief description of the rule's purpose and scope.

## Applicability
- Which modes this rule applies to
- When the rule should be enforced
```

### Rule Structure
```markdown
## Rule Definition

### Conditions
- Prerequisite conditions
- Context requirements
- Trigger events

### Actions
- Required steps
- Validation checks
- Success criteria

### Exceptions
- Valid exemptions
- Alternative workflows
- Special cases
```

### Cross-Referencing
```markdown
## Related Rules
- [Rule Name](../path/to/rule.md)
- [Category Name](../path/to/category/)

## Governance
References to governing principles:
- [Core Governance](../core/governance.md)
- [Mode Guidelines](../modes/guidelines.md)
```

### Error Handling
```markdown
## Error Scenarios

### Detection
- Error conditions
- Warning signs
- Validation failures

### Resolution
- Immediate actions
- Escalation path
- Recovery steps
```

### Documentation Standards
1. Use H1 (#) for rule name
2. Use H2 (##) for major sections
3. Use H3 (###) for subsections
4. Include version information at top
5. Date format: YYYY-MM-DD
6. Cross-references use relative paths
7. Code blocks use triple backticks with language

### Markdown Best Practices
- Use bullet points for lists
- Use numbered lists for sequential steps
- Include code blocks with language specification
- Use tables for structured data
- Use blockquotes for important notes
- Use emphasis (*italics*) for terms
- Use strong (**bold**) for warnings

## Template Usage
1. Copy relevant sections from this template
2. Fill in specific content
3. Update version information
4. Add cross-references
5. Validate markdown formatting
