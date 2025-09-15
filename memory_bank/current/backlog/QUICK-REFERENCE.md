# Quick Reference Guide

## Create New Task (5 minutes)
1. Copy `templates/task-template.md`
2. Save as `TASK-XXX-brief-description.md`
3. Fill required fields:
   - Problem statement & user story
   - 3+ acceptance criteria
   - Technical requirements (backend/frontend/testing)
   - Story point estimate (1,2,3,5,8,13)
4. Assess priority (P0/P1/P2/P3) using scoring:
   - User Impact + Business Value + Technical Risk + Urgency = Total
   - 16-20=P0, 12-15=P1, 8-11=P2, 4-7=P3
5. Move to appropriate `priorities/PX/` folder

## Sprint Planning (2 hours)
1. Copy `templates/sprint-planning-template.md`
2. Calculate team capacity:
   - Each developer: 32 hours/week × 2 weeks = 64 hours
   - Apply experience factor (Junior: 0.6x, Mid: 0.8x, Senior: 1.0x)
   - Convert to story points (estimate ~2 points per day)
3. Select tasks priority-first: P0 → P1 → P2 → P3
4. Verify all tasks meet Definition of Ready
5. Commit to achievable scope (80% of capacity)

## Daily Task Updates
- **Status Options:** Ready → In Progress → In Review → Done
- **Blocked Tasks:** Mark as blocked, identify blocker
- **Definition of Ready:** Check before starting
- **Definition of Done:** Check before completing

## Priority Quick Assessment
### P0 - Critical (Emergency)
- System down or unusable
- Data loss/corruption risk
- Critical security vulnerability
- Legal compliance deadline

### P1 - High (1-2 sprints)
- Core workflows broken/impaired
- Significant performance issues
- Modern service migration (high traffic)
- Important features ready to implement

### P2 - Medium (2-4 sprints)
- Feature improvements
- Technical debt
- Moderate bugs
- Modern service migration (low traffic)

### P3 - Low (Backlog)
- Nice-to-have features
- Minor improvements
- Research projects
- Polish and optimization

## Story Point Scale
- **1 pt:** 2-4 hours (text changes, config)
- **2 pts:** 4-8 hours (simple component, basic API)
- **3 pts:** 1-1.5 days (moderate component, migration)
- **5 pts:** 2-3 days (complex form, multi-component feature)
- **8 pts:** 3-5 days (feature spanning multiple areas)
- **13 pts:** 1-2 weeks (epic-level, should break down)

## Common Workflows

### Bug Triage
1. Reproduce and document steps
2. Assess impact using priority framework
3. Create task with bug template
4. Priority: P0 if critical, P1 if high impact, P2 if moderate

### Feature Request
1. Create task with clear user story
2. Define acceptance criteria
3. Break down technical requirements
4. Estimate effort and assess priority
5. Place in appropriate priority folder

### Technical Debt
1. Document current state and desired state
2. Assess impact on development velocity
3. Estimate effort for improvement
4. Priority usually P2 unless blocking development

## File Locations
- **Templates:** `templates/`
- **P0 Tasks:** `priorities/P0/`
- **P1 Tasks:** `priorities/P1/`
- **P2 Tasks:** `priorities/P2/`
- **P3 Tasks:** `priorities/P3/`
- **Current Sprint:** `active-sprint/`
- **Process Docs:** `process/`

## Quality Gates
### Definition of Ready
- [ ] Clear user story
- [ ] 3+ specific acceptance criteria
- [ ] Technical requirements defined
- [ ] Dependencies identified
- [ ] Effort estimated
- [ ] Priority assigned

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product owner accepted

## Getting Help
- **Process Questions:** Scrum Master
- **Priority Disputes:** Product Owner
- **Technical Issues:** Technical Lead
- **Templates/System:** Check `process/` documentation

---
Keep this guide handy for daily backlog management!