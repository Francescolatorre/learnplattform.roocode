# Requirements Engineering Claude Subagent Guide

## Overview

The Requirements Engineering Optimization Agent is a specialized Claude subagent designed specifically for your Learning Platform project. It understands your Django REST + React TypeScript architecture and provides intelligent analysis, optimization, and validation of requirements.

## Agent Capabilities

### 🎯 **Core Functions**

1. **Requirement Analysis** - Intelligent classification and complexity assessment
2. **Implementation Planning** - Detailed backend/frontend task breakdown
3. **Quality Validation** - Completeness and clarity checking
4. **Architecture Alignment** - Recommendations for modern TypeScript patterns
5. **Task Generation** - Specific Django/React implementation tasks

### 🏗️ **Platform-Specific Intelligence**

The agent understands your:
- **Tech Stack**: Django REST Framework, React, TypeScript, Material UI, PostgreSQL, JWT
- **Architecture Patterns**: Modern Service Layer, ServiceFactory, Composition over Inheritance
- **Development Workflow**: Feature branch development, modern TypeScript services
- **Current State**: TASK-012 Phase 1 complete, transitioning to Phase 2

## Usage Patterns

### 1. Analyze New Requirements

**Prompt:**
```
Analyze this requirement: "Students should be able to create study groups and collaborate on assignments with real-time chat functionality."
```

**Expected Output:**
- Requirement classification (Functional/Security/Performance/etc.)
- Priority assessment (Critical/High/Medium/Low)
- Architecture impact analysis
- Implementation task breakdown
- Technical recommendations

### 2. Create Structured Requirements

**Prompt:**
```
Create a requirement for: "As an instructor, I want to export student grades and analytics to CSV format for external reporting."
```

**Expected Output:**
- Complete structured requirement with ID
- User story format
- Detailed acceptance criteria
- Backend and frontend implementation tasks
- Technical specifications

### 3. Validate Existing Requirements

**Prompt:**
```
Validate this requirement: [paste existing requirement]
```

**Expected Output:**
- Completeness assessment
- Quality issues identification
- Missing information highlights
- Improvement suggestions

### 4. Generate Implementation Tasks

**Prompt:**
```
Generate implementation tasks for: "Multiple choice quiz with advanced analytics"
```

**Expected Output:**
- Detailed backend tasks (Django models, API endpoints)
- Frontend tasks (React components, TypeScript interfaces)
- Testing strategy
- Database considerations

### 5. Architecture Consultation

**Prompt:**
```
How should we implement real-time notifications considering our current service architecture?
```

**Expected Output:**
- Architecture recommendations
- Service layer integration approach
- Database design considerations
- Performance implications

## Best Practices

### 🎯 **When to Use the Agent**

**Ideal Scenarios:**
- New feature requirements need analysis
- Existing requirements need validation
- Implementation planning for complex features
- Architecture decisions for new functionality
- Task breakdown for development sprints

**Less Suitable For:**
- Simple bug fixes
- Minor UI changes
- Configuration updates
- Non-functional system tasks

### 📋 **How to Write Effective Prompts**

**Good Prompts:**
```
✅ "Analyze this requirement: [detailed requirement text]"
✅ "Create a requirement for student progress tracking with analytics"
✅ "Validate this quiz management requirement and identify gaps"
✅ "Generate tasks for implementing course enrollment with prerequisites"
```

**Less Effective Prompts:**
```
❌ "Help me with requirements"
❌ "What should I build?"
❌ "Fix this requirement"
❌ "Make this better"
```

### 🏗️ **Getting Better Results**

**Include Context:**
- Specify user role (student/instructor/admin)
- Mention related features or dependencies
- Include any constraints or preferences
- Reference existing functionality when relevant

**Be Specific:**
- Use concrete user stories when possible
- Include business objectives
- Mention performance requirements
- Specify integration points

## Output Formats

### 📊 **Analysis Output Structure**

```markdown
## Requirement Analysis
**Type:** [Classification]
**Priority:** [Level with justification]
**Complexity:** [Assessment with reasoning]
**Architecture Impact:** [Areas affected]

## Implementation Breakdown
### Backend Tasks:
- Specific Django/DRF implementations

### Frontend Tasks:
- React/TypeScript components and services

### Testing Strategy:
- Unit/Integration/E2E test requirements

## Technical Considerations:
- Platform-specific recommendations
- Performance implications
- Security considerations
```

### 📋 **Requirement Creation Structure**

```markdown
# Structured Requirement: [Feature Name]

## User Story
**As a** [user type]
**I want to** [functionality]
**So that** [business value]

## Acceptance Criteria
- Specific, testable criteria
- Edge case handling
- Performance requirements

## Implementation Tasks
### Backend Tasks:
- Django model changes
- API endpoint development
- Service layer updates

### Frontend Tasks:
- React component creation
- TypeScript interface definitions
- Modern service integration

## Technical Recommendations
- Architecture alignment
- Database considerations
- Performance optimization
```

## Integration with Development Workflow

### 🔄 **Development Process Integration**

1. **Requirements Phase**
   - Use agent to analyze stakeholder requirements
   - Generate structured requirements documents
   - Validate completeness and clarity

2. **Planning Phase**
   - Break down requirements into implementation tasks
   - Estimate effort and identify dependencies
   - Plan architecture changes

3. **Development Phase**
   - Reference generated tasks for implementation
   - Follow architecture recommendations
   - Implement testing strategies

4. **Review Phase**
   - Validate implementation against acceptance criteria
   - Check architecture alignment
   - Ensure quality standards

### 📁 **File Organization**

**Store outputs in appropriate memory bank folders:**
- `memory_bank/current/standards/` - Requirement standards and guidelines
- `memory_bank/current/decisions/` - Architecture decisions from requirements
- `memory_bank/current/workflows/` - User journey requirements

### 🔧 **Tool Integration**

**With existing project tools:**
- Export requirements to memory bank for persistence
- Use generated tasks in project planning tools
- Reference architecture recommendations in ADRs
- Include testing strategies in test planning

## Common Use Cases

### 🎓 **Learning Platform Specific Scenarios**

1. **Course Management Features**
   ```
   "Analyze requirement for course versioning and content management"
   ```

2. **Assessment System Enhancements**
   ```
   "Create requirement for peer review assignments with rubric-based grading"
   ```

3. **Student Engagement Features**
   ```
   "Validate requirement for discussion forums with threaded conversations"
   ```

4. **Analytics and Reporting**
   ```
   "Generate tasks for instructor dashboard with course analytics"
   ```

5. **Integration Requirements**
   ```
   "Analyze requirement for LMS integration with external plagiarism detection"
   ```

## Advanced Features

### 🔍 **Deep Analysis Capabilities**

The agent can provide:
- **Dependency Mapping** - Identify requirement relationships
- **Risk Assessment** - Technical and business risk evaluation
- **Effort Estimation** - Based on platform patterns and complexity
- **Alternative Solutions** - Multiple implementation approaches

### 🎯 **Specialized Analysis Types**

- **Performance Analysis** - For high-load features
- **Security Analysis** - For authentication/authorization features
- **UI/UX Analysis** - For interface and experience requirements
- **Integration Analysis** - For external system requirements

## Troubleshooting

### ❓ **Common Issues**

**Vague Output:**
- Provide more specific requirements text
- Include user context and business objectives
- Reference existing similar features

**Incomplete Analysis:**
- Ask for missing aspects specifically
- Request deeper analysis of specific areas
- Clarify platform constraints or requirements

**Architecture Misalignment:**
- Mention current architecture patterns explicitly
- Reference existing service implementations
- Specify integration points with current system

### 💡 **Tips for Better Results**

1. **Reference Existing Code** - Mention similar existing features
2. **Include Constraints** - Specify technical or business limitations
3. **Ask for Specific Formats** - Request particular output structures
4. **Iterate and Refine** - Build on previous analysis with follow-ups

## Conclusion

The Requirements Engineering Claude Subagent is a powerful tool for optimizing your learning platform development process. By providing intelligent analysis, structured requirements creation, and architecture-aligned recommendations, it helps ensure your requirements are complete, implementable, and aligned with your technical architecture.

Use this agent as a collaborative partner in your requirements engineering process to improve quality, reduce development time, and ensure consistency across your learning platform features.