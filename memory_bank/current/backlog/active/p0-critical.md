# P0 - Critical Priority Tasks

> **⚠️ CRITICAL**: These tasks require immediate attention and must be resolved within 24-48 hours.

## Criteria for P0 Classification
- System is broken or unusable
- Security vulnerability exposed
- Data integrity at risk
- Prevents other team members from working
- Regulatory compliance issue

## Current P0 Tasks

> **Target**: This section should normally be EMPTY except during genuine emergencies.

### Active P0 Items
*Currently: None (This is good!)*

### P0 Response Protocol
1. **Immediate Assessment** (within 2 hours)
   - Verify the issue severity
   - Assess user impact and scope
   - Identify root cause if obvious

2. **Emergency Response Team** (within 4 hours)
   - Assign primary developer
   - Assign backup developer
   - Notify stakeholders immediately

3. **Communication Plan**
   - Create incident channel/chat
   - Hourly updates to stakeholders
   - User communication if customer-facing

4. **Resolution Process**
   - Focus all available resources
   - Implement hotfix if needed
   - Deploy emergency patch
   - Post-incident review

## Recently Resolved P0 Items

### [Date] TASK-XXX: [Critical Issue Title]
- **Issue**: [Brief description]
- **Impact**: [User/system impact]
- **Resolution**: [How it was fixed]
- **Duration**: [Time to resolve]
- **Lessons Learned**: [Prevention measures]
- **Status**: ✅ Resolved

---

## P0 Escalation Contacts

### Technical Lead
- **Name**: [Primary technical lead]
- **Contact**: [Phone/Slack/Email]
- **Availability**: [Hours/timezone]

### Product Owner
- **Name**: [Product owner]
- **Contact**: [Phone/Slack/Email]
- **Role**: Business impact assessment

### DevOps/Infrastructure
- **Name**: [Infrastructure lead]
- **Contact**: [Phone/Slack/Email]
- **Role**: System recovery, deployment

## P0 Prevention Checklist

### Before Each Release
- [ ] Automated test suite passing
- [ ] Manual smoke testing completed
- [ ] Database migration tested in staging
- [ ] Rollback plan prepared and tested
- [ ] Monitoring and alerting configured

### During Development
- [ ] Security code review for sensitive changes
- [ ] Performance testing for high-impact features
- [ ] Integration testing with external services
- [ ] Error handling and graceful degradation
- [ ] Comprehensive logging for debugging

### Learning Platform Specific
- [ ] Student data integrity validated
- [ ] Authentication/authorization tested
- [ ] Course enrollment workflow verified
- [ ] Grading system functionality confirmed
- [ ] Modern service compatibility maintained (TASK-012)

## Incident Response Template

```markdown
## P0 INCIDENT: [Title]

**Incident ID**: INC-YYYY-MM-DD-XXX
**Started**: [Date/Time]
**Severity**: Critical (P0)
**Status**: [Investigating/Mitigating/Resolved]

### Impact Assessment
- **Users Affected**: [Number/percentage]
- **Systems Down**: [Components affected]
- **Business Impact**: [Revenue/user experience impact]

### Timeline
- **[Time]**: Issue reported by [source]
- **[Time]**: Investigation started
- **[Time]**: Root cause identified
- **[Time]**: Fix implemented
- **[Time]**: Resolution verified

### Root Cause
[Detailed explanation of what caused the issue]

### Resolution
[How the issue was resolved]

### Prevention
[What will be done to prevent recurrence]

### Lessons Learned
[Key insights for future prevention]
```

---

**Remember**: P0 tasks interrupt all other work. If you're adding a task here, ensure it truly meets P0 criteria. When in doubt, start with P1 and escalate if needed.