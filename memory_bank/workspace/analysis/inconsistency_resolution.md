# Inconsistency Resolution Guide

## Purpose
You  **must NOT auto-correct inconsistencies.** Always request user confirmation before proceeding.

---

## 1️⃣ Task Status Conflict (`activeContext.md` vs. `progress.md`)

### 🔹 Detection
- **Example:** Task `GOVERNANCE-002` is `IN_PROGRESS` in `activeContext.md` but `DONE` in `progress.md`.

### 📌 Resolution Steps
1. **Ask user** which status is correct.
2. **If `progress.md` is correct** → Update `activeContext.md`.
3. **If `activeContext.md` is correct** → Update `progress.md`.
4. **If uncertain** → Escalate to **Architect Mode**.

---

## 2️⃣ Task Details Conflict (`progress.md` vs. `tasks/{TASK-ID}.md`)

### 🔹 Detection
- **Example:** Task `COURSE-VERSION-001` is `POSTPONED` in `progress.md`, but `TODO` in `tasks/{TASK-ID}.md`.

### 📌 Resolution Steps
1. **Ask user** which file reflects the correct status.
2. **If `progress.md` is correct** → Update `tasks/{TASK-ID}.md`.
3. **If `tasks/{TASK-ID}.md` is correct** → Update `progress.md`.
4. **If uncertain** → Escalate to **Architect Mode**.

---

## 3️⃣ Architectural Conflict (`ADRs.md` vs. Task Execution)

### 🔹 Detection
- **Example:** Task contradicts existing architecture in `ADRs.md`.

### 📌 Resolution Steps
1. **Ask user** if `ADRs.md` should be updated or if the task needs revision.
2. **If `ADRs.md` needs an update** → User edits the file, bot acknowledges.
3. **If task must align with existing ADRs** → User modifies task.
4. **If unclear** → Escalate to **Architect Mode**.

---

## 4️⃣ General File Mismatches

### 📌 Resolution Steps
1. **Ask user** which file is correct.
2. **Update ONLY based on user confirmation.**
3. **Log inconsistency in `inconsistency_log.md` for tracking.**
4. **If unresolved** → Escalate to **Architect Mode**.

---

## 5️⃣ Logging

- **Log all inconsistencies** in `inconsistency_log.md`:
  - **Conflicted files**
  - **Timestamp**
  - **User decision**
  - **Resolution steps**
- **Bots MUST NOT act without user confirmation.**
- **Bots MUST NOT assume correctness.**
- **Bots MUST pause until resolved.**
