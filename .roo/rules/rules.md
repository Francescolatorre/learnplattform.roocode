# 🧠 Roo-Code Core Governance Rules

## Memory Bank Governance

### 🔍 Read Strategy

- **On initial execution**:
  - Read `activeContext.md` **once**.
  - If an **active task** exists, read **only** the necessary supporting files.
  - If **no active task** is found:
    - Check `project_status.md`.
    - If **no tasks are in progress**, **pause and wait** for input.

### 🔄 Consistency Checks (Boomerang Mode)

- Compare `activeContext.md` with `project_status.md`.
- If inconsistencies are found:
  - Follow steps in `inconsistency_resolution.md`.
  - Escalate unresolved issues to **Architect Mode**.

### 🛑 Resolution Protocol

- **STOP** immediately if a data inconsistency exists.
- Proceed only with **explicit user confirmation**.

### 📌 Mandatory Reads

- Always start with `activeContext.md`.
- After reading, declare: `[Memory Bank: active]`.
- Prompt the user to provide **any missing files**.

---

## 📋 Task Management Lifecycle

### 🧬 Task States & Roles

| Status       | Role           | Description                                                      |
|--------------|----------------|------------------------------------------------------------------|
| `DRAFT`      | Digital Design | Define requirements, user stories, and acceptance criteria       |
| `VALIDATED`  | Digital Design | Ensure completeness and business alignment                      |
| `TODO`       | Architect      | Finalize templates, identify risks and resources                |
| `IN_PROGRESS`| Code           | Implement, validate, document, and monitor                      |
| `DONE`       | Code           | Test, review, document, and update                              |
| `REVIEW`     | Architect      | Verify goals, assess quality, and provide feedback              |

### ✅ Task Review Criteria

- Tasks must meet:
  - Completeness
  - Clarity
  - Adequate resources
  - Risk awareness
  - Business alignment
- Tasks must be clearly defined before moving from `VALIDATED` to `TODO`.

### 🚦 Prioritization

- Prioritize **critical-path** items.
- Resolve dependencies before proceeding.
- Reassess **postponed tasks** regularly.
- Consider complexity and constraints when sequencing tasks.

---

## 🔁 Role Switching Protocol

| From → To           | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| Digital Design → Architect | Validate requirements, confirm feasibility, finalize specifications     |
| Architect → Code     | Define task, set `TODO`, provide context and challenges                 |
| Code → Architect     | Mark as `DONE`, document implementation, and request review             |
| Debug ↔ Code         | Switch freely when bugs block progress                                 |
| Any → Emergency Mode | Log blocker, switch mode, and escalate task                             |

---

## 📡 Status Updates

- Sync task data across all files.
- Use **standard statuses**:
  - `DRAFT`, `VALIDATED`, `TODO`, `IN_PROGRESS`, `DONE`, `POSTPONED`
- Include:
  - Timestamp
  - Reason for status change
  - Summary of knowledge or blockers
- `VALIDATED` tasks must be verified by Digital Design before promotion.

---

## 🤖 Automation Guidelines

- Automatically sync status and task file updates.
- Track deadlines via Git metadata.
- Run quality checks routinely.

---

## 🔐 Git Commit Rules

- Use this format:
  `[TASK-ID] [STATUS] [SUMMARY]`
- Include:
  - Validation status
  - Reason for change
- Stage all relevant files.
- Squash minor commits.
- Follow proper merge commit format.

---

## 💻 Language-Specific Rules

- Follow **Task Enhancement Framework** principles.
- For **Python/Django** projects:
  Refer to `memory_bank/languages/python_django_rules.yaml`
- For **React/TypeScript** projects:
  Refer to `memory_bank/languages/react_typescript_rules.yaml`

---

## 🧠 Final Note

> After every memory reset, you begin with zero internal state.
> Your only persistent context is the **Memory Bank**.
> Treat it as your **source of truth**—your functionality depends on it.
