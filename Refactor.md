# Refactoring the Roo System Prompt 

A **step‑by‑step field guide** for slimming the monolithic prompt, boosting its signal‑to‑noise ratio, and wiring it cleanly into your *learnplattform.roocode* repository.

---

## 0  Why this matters

* **\~6 900 → ≤ 900 tokens** per call → ↓ latency & cost ≈ 85 %
* Clearer separation of *immutable* core rules vs. *mutable* workspace facts
* Easier maintenance—each mode keeps only what is unique to it

---

## 0.1  How Roo builds the prompt (quick recap)

Roo **first** assembles its *internal* system prompt—this contains the baked‑in persona for the active mode (Code, Architect, Debug, etc.), full tool specs, and operational rules.
After that, it appends **USER'S CUSTOM INSTRUCTIONS** in the following order:

1. Language preference (if any)
2. Global instructions set via the Prompts tab
3. Mode‑specific instructions set via the Prompts tab **for the current mode**
4. Mode‑specific rule files from `.roo/rules-{modeSlug}/` (or `.roorules-{modeSlug}` fallback)
5. Workspace‑wide rule files from `.roo/rules/` (or `.roorules` fallback)

Sources that appear **earlier** in this list override those that come later when conflicts arise.  See Roo docs ➜ [https://docs.roocode.com/advanced-usage/prompt-structure](https://docs.roocode.com/advanced-usage/prompt-structure).

The lightweight *core contract* we create in step 3.1 therefore lives at level 5—**it augments (but does not replace) the built‑in mode definitions**.  If you truly need to override the entire system prompt for a mode, use *Custom System Prompts* (`.roo/system-prompt-<mode_slug>`), which is outside the scope of this guide.

## 1  Bird’s‑eye architecture

```
.roo/
├─ rules/
│  ├─ 00-core-contract.md      # ≤ 400 tokens
│  ├─ 10-variables.env         # auto‑generated per IDE launch
│  └─ 90-process-refs.md       # links to escalation / review docs
├─ rules-code/                 # mode‑specific overrides
│  ├─ 01-vite-frontend.md
│  └─ 02-drf-backend.md
└─ scripts/
   └─ build-env-vars.py        # populates variables.env
```

> **Rule precedence**: files in `.roo/rules/` are concatenated **before** any `.roo/rules-*` directory. The agent therefore reads the core contract first, then variables, then mode‑specific rules.

---

## 2  Prerequisites

* Python ≥ 3.10 (for the tiny build script)
* Existing `.roo` rules already under version control
* CI pipeline capable of running `npm` scripts

---

## 3  Step‑by‑step implementation

### 3.1  Create the *Core Contract*

The core contract should be **persona‑agnostic**—each mode already has its own built‑in description. We only add cross‑mode operational constraints. 

1. **Path** `/.roo/rules/00-core-contract.md` — create the file (≤ 400 tokens). Do **not** restate “You are Roo…”; that comes from the mode’s system prompt. 
2. Remove duplicate text (tool grammar, path constraints, etc.) from every mode file.

```markdown
**ALWAYS**  
1 · One XML tool envelope per message.  
2 · Think privately in `<thinking>`; expose only XML or `<attempt_completion>`.  
3 · Wait for explicit success after each tool call.  
4 · ⚠️ When editing a file you **MUST** write its *complete* content — partial writes forbidden.  
5 · Ask clarifying questions solely via `<ask_followup_question>` (include 2‑4 concrete suggestions).  
6 · Never reference paths outside `{{WORKSPACE_DIR}}`.  

**Modes (summary)**  
| slug | purpose | hard limits |  
|------|---------|-------------|  
| code | implement & test | cannot delegate |  
| architect | define tasks & ADRs | only `*.md` edits |  
| debug | diagnose failures | read‑only except patches |
| ask | answer questions & info | read‑only, no file edits |
```

### 3.2  Inject runtime variables

1. Add `scripts/build-env-vars.py` (see § *Code snippet*).
2. Hook it into a *post‑start* VS Code task or `python scripts/build-env-vars.py` so it runs **once** per IDE session.
3. Variables available in prompts as `{{VAR}}`.

```python
#!/usr/bin/env python3
from pathlib import Path
import os
from datetime import date

env = {
    "WORKSPACE_DIR": str(Path.cwd()),
    "OS": os.name,
    "DEFAULT_SHELL": os.environ.get("SHELL", "pwsh"),
    "DATE_ISO": date.today().isoformat(),
}

variables_path = Path(".roo") / "rules" / "10-variables.env"
variables_path.write_text(
    "
".join(f"{k}={v}" for k, v in env.items())
)
print(f"Wrote {variables_path}")
```

### 3.3  Move bulky docs out of the prompt

* Keep **links only** in `90-process-refs.md`, e.g.

  ```markdown
  See escalation → `docs/rules/processes/escalation.md`
  ```
* Delete repeated prose from mode files once linked.

### 3.4  Tidy each mode directory

* Retain mode‑specific *hard limits* and behaviours.
* Strip any rule already present in the core contract.

### 3.5  Wire up the measurement harness (optional but recommended)

1. Install **LLMLingua** or use a simple ablation script.
2. Add `npm run test:prompt` to compute:

   * total tokens
   * SNR (importance‑weighted)
   * compression ratio vs. baseline
   * Δ‑pass\@k (tiny sample eval)
3. Fail CI if:

   * `SNR < 0.65` **or**
   * `Δ‑pass@k > 1 %`.

### 3.5a  Adding custom modes (optional)

Roo lets you define **completely new modes** that load *between* Prompts‑tab overrides and workspace‑wide rules.  Follow the [Custom Modes guide](https://docs.roocode.com/features/custom-modes):

1. **Create** `.roo/modes/<mode_slug>/`.
2. Inside that directory add at minimum:

   * `persona.md` → a one‑paragraph description of the role.
   * `rules.md` → mode‑specific hard limits & capabilities.
   * *(Optional)* `system-prompt.md` if you need to override Roo’s built‑in persona entirely.
3. Keep each file concise (≤ 400 tokens when possible); link to extended docs in `docs/modes/<slug>/`.
4. Update the *Modes (summary)* table in the core contract to include the new slug.
5. Test by switching modes in the VS Code sidebar and ensuring your custom rules appear in the *Prompt Preview* panel.

---

### 3.6  Migration checklist

| ✔︎ | Task                                           |
| -- | ---------------------------------------------- |
| ☐  | Commit *core contract* file                    |
| ☐  | Push `build-env-vars.py`; add to dev‑init task |
| ☐  | Prune duplicate text from mode files           |
| ☐  | Commit links in `90-process-refs.md`           |
| ☐  | Run CI; confirm token count & tests            |

---

## 4  Validation

* Compare *before / after* prompt length via `npm run test:prompt`.
* Observe latency drop in dev console (\~54 ms → \~7 ms for GPT‑4o at 128 T/s).
* Confirm agent behaviour unchanged on a known test suite.

---

## 5  Further references

* Roo Code precedence rules — [https://docs.roocode.com/features/custom-instructions](https://docs.roocode.com/features/custom-instructions)
* LLMLingua compression — [https://github.com/microsoft/LLM-Lingua](https://github.com/microsoft/LLM-Lingua)
* This repo’s escalation & review processes — see `docs/rules/processes/`.

---

*Last updated: {{DATE\_ISO}}*
