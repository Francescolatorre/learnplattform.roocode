# ADR-001: TypeScript-Typenstruktur

## Kontext

Unser Projekt enthält zahlreiche TypeScript-Definitionen, darunter:

- Gemeinsame Typen wie `IPaginatedResponse`, die von mehreren Services verwendet werden
- Feature-spezifische Typen, die nur innerhalb eines bestimmten Funktionsbereichs relevant sind

Eine klare Strukturierung dieser Typen ist wichtig für die Wartbarkeit, Lesbarkeit und Skalierbarkeit des Codes.

## Entscheidung

Wir haben uns für folgende Strukturierung von TypeScript-Definitionen entschieden:

1. **Gemeinsame/Globale Typen**:
   - Speicherort: `src/types/common/`
   - Unterteilt in thematische Dateien wie `api.ts`, `entities.ts`, etc.
   - Re-Export über `src/types/index.ts`

2. **Feature-spezifische Typen**:
   - Speicherort: `src/features/<feature-name>/types/`
   - In thematische Dateien unterteilt (z.B. `courseTypes.ts`)
   - Re-Export über `src/features/<feature-name>/types/index.ts`

3. **Import-Konventionen**:
   - Globale Typen: `import { IPaginatedResponse } from '@/types';`
   - Feature-Typen: `import { ICourse } from '@features/courses/types';`

4. **Schnittstellen zwischen Features**:
   - Wenn ein Feature Typen aus einem anderen Feature benötigt, sollten "Basic"-Versionen der Typen verwendet werden, die nur die notwendigen Eigenschaften enthalten

## Konsequenzen

### Vorteile

- Klare, konsistente Organisation von Typdefinitionen
- Verbesserte Auffindbarkeit und Lesbarkeit des Codes
- Reduzierte Abhängigkeiten zwischen Features
- Vereinfachtes Refactoring und Erweiterung

### Nachteile

- Anfänglicher Aufwand für die Umstrukturierung bestehender Typen
- Mögliche Duplikation bei "Basic"-Typen zwischen Features

## Status

Angenommen, 31.03.2025

## Referenzen

- [TypeScript-Dokumentation zu Modulen](https://www.typescriptlang.org/docs/handbook/modules.html)
- [React+TypeScript Best Practices](https://github.com/typescript-cheatsheets/react)
