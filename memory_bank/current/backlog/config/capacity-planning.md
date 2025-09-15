# Capacity Planning and Sprint Management

## Sprint Framework

### Sprint Duration
- **Standard Sprint**: 2 weeks (10 working days)
- **Short Sprint**: 1 week (for critical fixes or experimental cycles)
- **Extended Sprint**: 3 weeks (for major feature releases, used sparingly)

### Sprint Capacity Guidelines

#### Team Composition Assumptions
- **Full-Stack Developer**: 8 hours/day, 80 hours/sprint
- **Frontend Specialist**: 8 hours/day, 80 hours/sprint
- **Backend Specialist**: 8 hours/day, 80 hours/sprint
- **Availability Factor**: 70% (accounting for meetings, code review, support)

#### Effective Capacity per Sprint
- **Single Developer**: ~55 productive hours (7 story points avg)
- **Two Developers**: ~110 productive hours (14 story points avg)
- **Three+ Developers**: Scale linearly with 10% coordination overhead

## Story Point Estimation

### Fibonacci Scale with Learning Platform Context

#### 1 Point (2-4 hours)
- **Examples**: Minor UI text changes, simple bug fixes, configuration updates
- **Learning Platform**: Update button labels, fix broken links, adjust CSS styles
- **Complexity**: No new logic, minimal testing required

#### 2 Points (4-8 hours)
- **Examples**: Small feature additions, minor API changes, unit test writing
- **Learning Platform**: Add validation to forms, create simple React components, update database field
- **Complexity**: Some new logic, standard testing patterns

#### 3 Points (8-12 hours)
- **Examples**: Medium features, component refactoring, integration work
- **Learning Platform**: Implement task filtering, create course listing component, add modern service integration
- **Complexity**: Moderate complexity, multiple components affected

#### 5 Points (12-20 hours)
- **Examples**: Significant features, database migrations, API endpoint creation
- **Learning Platform**: Build grading interface, implement enrollment workflow, create progress tracking
- **Complexity**: High complexity, requires design decisions

#### 8 Points (20-32 hours)
- **Examples**: Large features, major refactoring, complex integrations
- **Learning Platform**: Complete course management system, implement modern service architecture
- **Complexity**: Very high complexity, multiple systems involved

#### 13 Points (32+ hours)
- **Examples**: Epic-level work, architectural changes, major system redesign
- **Learning Platform**: Complete TypeScript service migration, redesign student journey
- **Complexity**: Should be broken down into smaller tasks

### Estimation Guidelines

#### Consider These Factors
1. **Technical Complexity**: Algorithm complexity, system integration points
2. **Unknown Dependencies**: Third-party services, unclear requirements
3. **Testing Requirements**: Unit tests, integration tests, E2E scenarios
4. **Documentation Needs**: API docs, user guides, architectural decisions
5. **Review Cycles**: Code review, stakeholder feedback, iteration cycles

#### Learning Platform Specific Complexity Modifiers
- **Modern Service Integration**: +1 point for legacy→modern migration
- **Database Changes**: +1 point for migrations affecting production data
- **Authentication/Authorization**: +1-2 points for security-sensitive changes
- **Cross-Component Changes**: +1 point for changes affecting multiple services
- **Performance Requirements**: +1-2 points for optimization work

## Sprint Planning Process

### Pre-Planning (1 week before sprint)
1. **Backlog Grooming**: Ensure P1/P2 tasks have story point estimates
2. **Dependency Review**: Identify and resolve blocking dependencies
3. **Capacity Assessment**: Account for vacations, meetings, support duties
4. **Stakeholder Input**: Gather feedback on priority changes or new requirements

### Sprint Planning Meeting (2 hours max)
1. **Sprint Goal Definition**: Clear, measurable objective for the sprint
2. **Capacity Confirmation**: Team availability and commitment level
3. **Task Selection**: Choose tasks that align with sprint goal and capacity
4. **Task Breakdown**: Ensure all selected tasks are appropriately sized
5. **Definition of Done Review**: Confirm acceptance criteria for each task

### Sprint Planning Template
```markdown
## Sprint N Planning (Date Range)

### Sprint Goal
[Clear, measurable objective that provides focus and value]

### Team Capacity
- Available Team Members: [List with availability %]
- Total Story Points Capacity: [Number based on team velocity]
- Holidays/PTO Impact: [Any capacity reductions]

### Selected Tasks
| Task ID | Title | Priority | Story Points | Assignee | Dependencies |
|---------|--------|----------|--------------|----------|---------------|
| TASK-XXX | [Title] | P1 | 5 | [Name] | [Dependencies] |

### Definition of Done Checklist
- [ ] Code review completed
- [ ] Unit tests written and passing
- [ ] Integration tests updated
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] Acceptance criteria validated

### Risks and Mitigation
- **Risk**: [Description]
  **Mitigation**: [Plan]
```

## Velocity Tracking

### Historical Velocity Data
Track these metrics for continuous improvement:

- **Story Points Completed per Sprint**
- **Story Points Committed vs Completed**
- **Average Task Size**
- **Cycle Time per Story Point**
- **Defect Rate by Sprint**

### Velocity Calculation
```
Sprint Velocity = Sum of Story Points for Completed Tasks
Team Velocity = Average Velocity over last 3-5 sprints
Capacity Planning = Team Velocity ± 20% buffer
```

### Learning Platform Velocity Benchmarks
Based on project patterns:
- **New Feature Development**: 6-8 story points per developer per sprint
- **Bug Fixing and Maintenance**: 8-10 story points per developer per sprint
- **Refactoring and Technical Debt**: 4-6 story points per developer per sprint
- **Research and Spikes**: 2-4 story points per developer per sprint

## Capacity Planning Scenarios

### Scenario 1: Single Developer (Learning Platform Maintenance)
- **Capacity**: 7 story points per sprint
- **Focus**: Bug fixes, small features, code quality improvements
- **Sprint Mix**: 1-2 medium tasks (3-5 points) + several small tasks (1-2 points)

### Scenario 2: Two Developers (Feature Development)
- **Capacity**: 14 story points per sprint
- **Focus**: New features, modern service migration, UX improvements
- **Sprint Mix**: 1 large task (8 points) + 1 medium task (5 points) + small tasks

### Scenario 3: Three+ Developers (Major Release)
- **Capacity**: 20+ story points per sprint
- **Focus**: Complex features, architectural changes, comprehensive testing
- **Sprint Mix**: Multiple large tasks with clear ownership and minimal dependencies

## Sprint Adjustment Guidelines

### Mid-Sprint Adjustments
- **Scope Reduction**: Remove lowest priority items first
- **Scope Addition**: Only add if same-size tasks are removed
- **Emergency Work**: Document impact on sprint commitments

### Sprint Retrospective Improvements
- **Over-commitment**: Reduce next sprint capacity by 10-20%
- **Under-commitment**: Increase next sprint capacity by 10-20%
- **Estimation Issues**: Review and calibrate story point scale
- **Dependency Problems**: Improve dependency identification process

This capacity planning framework ensures realistic sprint commitments while maintaining steady delivery velocity for the Learning Platform project.