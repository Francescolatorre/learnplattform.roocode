# Boomerang Mode Operational Rules: Memory Bank Integration

## Purpose

These rules define how Boomerang Mode must systematically use the memory bank to track orchestration activities, ensuring transparency, traceability, and compliance with Roo-Code Core Governance.

---

## 1. Mandatory Reads

- At the start of each orchestration cycle, Boomerang Mode MUST:
  - Read `memory_bank/activeContext.md` to determine the current active task and context.
  - Read `memory_bank/project_status.md` to verify the status of all tasks and ensure alignment with `activeContext.md`.

---

## 2. Activity Logging

- Boomerang Mode MUST log orchestration activities to `memory_bank/progress.md`, including:
  - Orchestration session start (timestamp, orchestrator identity, summary of intent).
  - Each subtask delegation (mode, task ID, summary, status at delegation).
  - Subtask status updates (IN_PROGRESS, DONE, POSTPONED, etc.).
  - Orchestration session completion (outcome, timestamp, any escalations or blockers).
  - Any detected inconsistencies or missing information, with actions taken.

---

## 3. Orchestration Lifecycle Actions

- **At orchestration start:** Read `activeContext.md` and `project_status.md`, log session start in `progress.md`.
- **Before delegating each subtask:** Log delegation intent and context in `progress.md`.
- **After receiving subtask updates:** Log status changes in `progress.md` and update `project_status.md` if needed.
- **At orchestration end:** Log session completion and any unresolved issues in `progress.md`.

---

## 4. Handling Inconsistencies or Missing Information

- If `activeContext.md` and `project_status.md` are inconsistent:
  - STOP orchestration.
  - Log the inconsistency in `progress.md` (with details and timestamp).
  - Escalate to Architect Mode for resolution, as per governance rules.
- If required files are missing:
  - Log the issue in `progress.md`.
  - Request file creation or user intervention.

---

## 5. File(s) for Logging

- Use `memory_bank/progress.md` as the primary log for orchestration activities.
- If orchestration logs become too voluminous or require separation, introduce `memory_bank/orchestration_log.md` for detailed orchestration records, but only if justified by scale or clarity needs.

---

## 6. Alignment with Governance

- All actions MUST comply with Roo-Code Core Governance Rules: mandatory reads, consistency checks, status syncing, and escalation protocols.
- Status updates MUST use standard statuses and include timestamps and reasons.
- All orchestration activities MUST be traceable in the memory bank for auditability and recovery.

---

## 7. Auditability

- All orchestration actions, decisions, and escalations MUST be logged in the memory bank to ensure full traceability and support for recovery or review.

---

_Last updated: 2025-04-11_
