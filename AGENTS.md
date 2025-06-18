# AGENTS.md

## Scope

Diese Datei gilt für das gesamte Repository, sofern keine spezifischeren AGENTS.md-Dateien in Unterverzeichnissen existieren.

---

## 1. Coding Conventions

### Backend (Django, DRF)

- PEP8, Black-Formatierung, pylint.
- Django 4.2.9, DRF, JWT (djangorestframework-simplejwt).
- Verwende ViewSets, permission_classes, select_related/prefetch_related.
- Logging mit lazy `%`-Formatierung.
- Tests: pytest, pytest-django, factory_boy.
- API-Dokumentation: drf-yasg.
- Unterscheide klar zwischen LearningTask (User-facing) und DevTask (Entwickler-Aufgaben).

### Frontend (React, TypeScript)

- React 18, TypeScript (strict), Material UI, Zustand, React Query, Axios.
- Komponenten in `/components/common/` und `/features/*`.
- Interfaces mit `I`-Prefix, enums für Konstanten.
- API-Layer zentral, Fehlerbehandlung zentralisieren.
- Tests: Vitest, Playwright, React Testing Library.
- Nutze data-testid für UI-Elemente in Tests.
- Routing: React Router v7 mit `startTransition`-Flag.

### Allgemein

- Vertikale Slices: Backend, API, Frontend, Tests immer zusammenhängend implementieren.
- Tests sind Pflicht (Unit, Integration, E2E).
- Dokumentiere alle APIs und komplexe Logik.
- Accessibility: ARIA, Tastatur-Navigation.
- Performance: Lazy Loading, Memoization, optimierte Queries.

---

## 2. Git & Commit Policy

- Keine neuen Branches für Agenten-Commits.
- Commit-Format: `[DEVTASK-ID] [STATUS] [SUMMARY]`
  - Beispiel: `TASK-API-001 IN_PROGRESS Implement auth endpoints`
- Committe nur, wenn der Arbeitsbaum sauber ist (`git status` muss clean sein).
- Pre-commit-Hooks müssen erfolgreich durchlaufen werden.
- Keine bestehenden Commits ändern oder rebasen.

---

## 3. AGENTS.md Handling

- Diese Datei und alle tieferliegenden AGENTS.md sind bindend für alle Agenten.
- Bei Konflikten gilt die am tiefsten verschachtelte AGENTS.md.
- System-/User-Prompts haben Vorrang vor AGENTS.md.
- Für jede bearbeitete Datei müssen die Anweisungen der jeweils zuständigen AGENTS.md beachtet werden.

---

## 4. Programmatic Checks

- Nach jeder Änderung müssen alle im Projekt vorhandenen automatisierten Checks (Tests, Linter, Typprüfungen, etc.) ausgeführt werden.
- Für Backend: `pytest`, Linter, Black.
- Für Frontend: `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, Linter, TypeScript-Checks.
- Bei Fehlern: Korrigieren und erneut prüfen, bis alle Checks erfolgreich sind.

---

## 5. PR/Commit Message Instructions

- PR-Beschreibungen müssen:
  - Zusammenfassen, was geändert wurde (inkl. vertikaler Integration).
  - Validierungsergebnisse (Testausgaben) als Zitate angeben.
  - Citations nach Vorgabe:
    - `【F:<file_path>†L<line_start>(-L<line_end>)?】` für Dateien
    - `【<chunk_id>†L<line_start>(-L<line_end>)?】` für Terminalausgaben
- Keine Zitate aus PR-Diffs oder Kommentaren, keine Git-Hashes als chunk_id.

---

## 6. Special Project Rules

- LearningTask ≠ DevTask (immer klar trennen).
- DevTasks im Ordner `memory_bank/tasks/` dokumentieren und Lifecycle beachten.
- ADRs im Ordner `memory_bank/ADRs/` pflegen.
- Aktuellen Entwicklungsfokus in `memory_bank/activeContext.md` dokumentieren.
- Fortschritt in `memory_bank/progress.md` nachhalten.

---

## 7. Weitere Hinweise

- Bei Unsicherheiten: Siehe weitere AGENTS.md in Unterverzeichnissen oder frage nach.
- Änderungen an dieser Datei müssen mit dem Team abgestimmt werden.

---

**Beispiel für einen programmatic check (Backend):**

```sh
cd Backend
pytest
black --check .
pylint core/
```

**Beispiel für einen programmatic check (Frontend):**

```sh
cd frontend
npm run test:unit
npm run test:integration
npm run test:e2e
npm run lint
tsc --noEmit
```

---

Mit dieser Struktur erfüllt eure AGENTS.md die Anforderungen des Systemprompts und bietet klare, projektbezogene Anweisungen für Agenten und Entwickler.
