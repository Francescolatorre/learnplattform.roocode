---
description: Generate comprehensive handover document for session transitions
allowed-tools: Read(*), Write(*), Edit(*), Bash(git *), TodoWrite(*)
---

Generate comprehensive handover document for session transitions.

**Usage**: /handover [optional: specific area]
**Specific area**: $ARGUMENTS

Create detailed handover with:
- Current project state
- Active work in progress
- Next steps and priorities
- Commit summary and git status
- Any blockers or issues

The handover will be saved to `memory_bank/temp/session-handover.md` for the next session.