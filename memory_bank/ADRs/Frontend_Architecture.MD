# Architekturentscheidungen: Frontend der Lernplattform

## Entscheidung: Technologien und Struktur

### 1. **Build-Tool**: Vite

- Vite wird als Build-Tool und Entwicklungsserver genutzt, um schnellere Builds und Hot Module Replacement (HMR) zu ermöglichen.

### 2. **Frontend-Framework**: React

- React wird für die Benutzeroberfläche verwendet, um eine komponentenbasierte Architektur mit hoher Wiederverwendbarkeit zu ermöglichen.

### 3. **UI-Bibliothek**: Material UI (MUI)

- Material UI wird als Design-System genutzt, um konsistente und ansprechende UI-Komponenten bereitzustellen.

### 4. **State-Management**: Zustand

- Zustand wird für die zentrale Verwaltung des Anwendungszustands genutzt, um eine schlanke und performante State-Management-Lösung bereitzustellen.

### 5. **Test-Framework**: Playwright

- End-to-End-Tests werden mit Playwright durchgeführt, um UI- und API-Stabilität sicherzustellen.

### 6. **Programmiersprache**: TypeScript

- TypeScript wird genutzt, um Typensicherheit und bessere Wartbarkeit des Codes zu gewährleisten.

### 7. **Linting**: ESLint

- ESLint wird zur Code-Qualitätssicherung und Konsistenz innerhalb des Projekts genutzt.

### 8. **Projektstruktur**

```
frontend/
│── src/
│   ├── api/                # API-Schicht (Kommunikation mit Backend)
│   │   ├── axiosClient.ts  # Zentrale API-Client-Konfiguration
│   │   ├── coursesApi.ts   # API-Funktionen für Kurse
│   │   ├── tasksApi.ts     # API-Funktionen für Lerneinheiten & Aufgaben
│   │   ├── quizzesApi.ts   # API-Funktionen für Multiple-Choice-Tests
│   │   ├── authApi.ts      # API-Funktionen für Authentifizierung (Login, Logout)
│   ├── components/         # Wiederverwendbare UI-Komponenten (Button, Card, Modal, etc.)
│   ├── hooks/              # Custom Hooks für Zustand und API-Calls
│   ├── pages/              # Seiten (Dashboard, Kursseite, Testseite, Login, Profil)
│   ├── store/              # Zustand (Zustand für State-Management)
│   ├── tests/              # End-to-End-Tests mit Playwright
│   ├── utils/              # Hilfsfunktionen (z. B. Formatierungen, Validierungen)
│── public/
│── package.json
│── playwright.config.ts    # Konfiguration für Playwright-Tests
│── .eslintrc.json          # ESLint-Konfiguration
│── vite.config.ts          # Vite-Konfiguration
```

### 9. **API-Schicht (Isolierte Kommunikation mit dem Backend)**

- API-Module wurden auf Basis der OpenAPI-Spezifikation erweitert:
  - `coursesApi.ts` → Kurse abrufen, erstellen, bearbeiten, löschen (`/courses/`)
  - `tasksApi.ts` → Lerneinheiten & Aufgaben (`/tasks/learning-tasks/`)
  - `quizzesApi.ts` → Multiple-Choice-Tests (`/tasks/multiple-choice-quizzes/`)
  - `authApi.ts` → Benutzer-Authentifizierung (`/users/login/`, `/users/logout/`)

### 10. **Zustandsverwaltung mit Zustand**

- Der Zustand für **Kurse, Aufgaben und Tests** wird in separaten Stores verwaltet:
  - `coursesStore.ts`
  - `tasksStore.ts`
  - `quizzesStore.ts`
  - `authStore.ts` für den Login-Status
- Durch **getrennte Stores** werden Seiteneffekte minimiert.

### 11. **UI-Komponenten sind stateless**

- UI-Komponenten erhalten ihre Daten über **Props** und bleiben unabhängig vom globalen Zustand.
- Material UI (MUI) wird als primäre Design-Bibliothek verwendet.

### 12. **End-to-End-Tests mit Playwright**

- Tests überprüfen die Hauptfunktionen wie **Login, Kursnavigation, Tests abschließen**.

### 13. **Linting mit ESLint**

- ESLint wird eingesetzt, um Code-Style und Best Practices sicherzustellen.

---

## **Konzeptionelle Ideen & Best Practices**

### **1. Trennung von Zustands- und UI-Logik**
- React-Komponenten sollten möglichst **stateless** sein und keine Geschäftslogik enthalten.
- Die API-Kommunikation und Datenverarbeitung erfolgt in **Hooks oder Services** (`hooks/`, `store/`).

### **2. Fehlerhandling & Resilienz**
- **Axios-Interceptors** für globale Fehlerbehandlung und automatische Token-Erneuerung in `axiosClient.ts`.
- UI-Feedback durch **Snackbar-Notifications (Material UI)**.

### **3. Skalierbarkeit durch Code-Splitting**
- **React Lazy Loading & Suspense** für das Laden von Modulen.
- **Dynamisches Laden von Routen** mit `React Router`.

### **4. Performance-Optimierung**
- Memoization mit `React.memo()` und `useMemo()` zur Vermeidung unnötiger Re-Renders.
- Optimierung von API-Calls mit **React Query oder SWR (optional)**.
- **Code-Splitting und Lazy Loading für Routen** implementieren.
- **Strategie für Caching von API-Responses definieren**.

### **5. Sicherheit & Authentifizierung**
- **JWT-Handling** mit lokalem Speicher oder `httpOnly` Cookies.
- Zugriffsbeschränkungen mit **React Context für Auth** und Middleware in den Routen.

### **6. Testing-Ansatz verbessern**
- **Unit-Tests für Komponenten und Hooks einführen** (Jest, Testing Library).
- **Integration-Tests für die Zusammenarbeit von Komponenten implementieren**.

### **7. Fehlerbehandlung verbessern**
- **Globale Fehlerbehandlung für API-Anfragen implementieren**.
- **Benutzerfreundliche Fehlermeldungen und Fallback-UI definieren**.

### **8. Build und Deployment**
- **CI/CD-Pipeline definieren**.
- **Build-Optimierungen für Produktionsumgebung festlegen**.

### **9. Dokumentation**
- **Komponentendokumentation mit Storybook oder ähnlichen Tools einführen**.
- **API-Nutzung und State Management dokumentieren**.

Diese **Best Practices** helfen dabei, das Frontend langfristig **skalierbar, wartbar und performant** zu halten.

