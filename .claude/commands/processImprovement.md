---
description: Automatically derive lightweight process updates from session learnings without over-engineering
allowed-tools: Read(*), Edit(*), MultiEdit(*), Glob(*), Grep(*), TodoWrite(*)
---

Analyze session patterns and derive minimal, targeted process improvements from learnings without over-engineering.

**Analysis Target**: $ARGUMENTS (optional: session-summary, current-issues, or auto-detect)

**Analysis Steps:**
1. **Issue Pattern Recognition**: Review recent session challenges, blockers, and repeated problems
2. **Root Cause Analysis**: Identify underlying process gaps (not individual mistakes) 
3. **Impact Assessment**: Focus on high-impact, low-overhead improvements
4. **Existing Process Review**: Check current ADRs, agents.md, and Definition of Done
5. **Lightweight Solution Design**: Create simple rules, checklists, or guidelines

**Update Targets:**
- Add 1-3 critical checkboxes to Definition of Done (ADR-020)
- Insert targeted guidance in agents.md (1-2 sentences max)
- Create simple decision trees or checklists
- **Avoid**: Complex workflows, heavy documentation, elaborate processes

**Core Philosophy**: "Make the right thing easy, wrong thing obvious" - focus on judgment aids, not bureaucracy

**Output**: Specific file updates with rationale, targeting prevention of recurring issues through minimal process enhancements

**Examples of Good Improvements:**
- Adding "UI Navigation Audit" checkbox to catch zombie features
- "E2E tests are hard gates" rule to prevent delivery of broken functionality  
- "Multi-interface coverage" requirement to prevent scope misses

**Examples to Avoid:**
- Complex approval workflows
- Detailed documentation requirements
- Heavy architectural review processes
- Elaborate tracking systems