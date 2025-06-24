# Enhanced Notification System

> **Migration Strategy (Manual, No Script)**
>
> This project has migrated from legacy notification APIs to a unified, extensible notification system. All developers must follow the manual migration process below—no migration scripts are provided or permitted.
>
> **Actionable Steps:**
> 1. **Update Imports:** Replace all legacy notification imports (e.g., `ErrorNotification`, `showErrorNotification`) with the new `useNotification` hook and `NotificationProvider`.
> 2. **Refactor Usage:** Change all notification calls to use the `notify` function from `useNotification`. See the [Migration Guide](#migration-guide) below for code examples.
> 3. **Provider Update:** Ensure your app is wrapped in a single `NotificationProvider`.
> 4. **Remove Deprecated Code:** Delete all legacy notification components/utilities.
> 5. **Gradual Migration:** You may update modules incrementally; deprecated APIs emit warnings until removal in the next major release.
> 6. **Monitoring:** Watch for deprecation warnings in logs and test all notification scenarios after migration.
> 7. **Issue Resolution:** Report migration issues via the project tracker.
> 8. **Removal Plan:** Deprecated APIs will be removed in the next major release. Complete migration before upgrading.
>
> **References:**
> - [Migration Guide](#migration-guide) (detailed steps/checklist)
> - [`ADR-012-frontend-error-notification-system.md`](../../../../memory_bank/ADRs/ADR-012-frontend-error-notification-system.md:1) (architecture rationale)
>

A flexible, accessible notification system for managing and displaying multiple notifications with priority queuing.

## Overview

The enhanced notification system provides a robust solution for displaying notifications in your React application. Key features include:

- Multiple concurrent notifications with visual stacking
- Priority-based queue management
- Customizable positioning and duration
- Built-in accessibility support
- Smooth animations and transitions
- TypeScript support

## Components

### NotificationProvider

The root component that manages the notification state and queue.

```tsx
import { NotificationProvider } from './NotificationProvider';

function App() {
  return (
    <NotificationProvider
      maxVisible={3}
      position={{ vertical: 'top', horizontal: 'right' }}
      defaultDuration={5000}
    >
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxVisible` | `number` | `3` | Maximum number of visible notifications |
| `position` | `{ vertical: 'top' \| 'bottom', horizontal: 'left' \| 'right' }` | `{ vertical: 'bottom', horizontal: 'right' }` | Position of the notification stack |
| `defaultDuration` | `number` | `5000` | Default duration in milliseconds before auto-dismiss |
| `children` | `ReactNode` | - | Child components |

### useNotification Hook

A hook for triggering notifications from any component.

```tsx
import { useNotification } from './NotificationProvider';

function MyComponent() {
  const notify = useNotification();

  const handleClick = () => {
    notify({
      title: 'Success',
      message: 'Operation completed',
      severity: 'success',
      duration: 3000,
      priority: 2
    });
  };

  return <button onClick={handleClick}>Show Notification</button>;
}
```

#### Notification Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `title` | `string` | No | Notification title |
| `message` | `string` | Yes | Main notification message |
| `severity` | `'success' \| 'info' \| 'warning' \| 'error'` | No | Severity level (affects styling) |
| `duration` | `number` | No | Display duration in milliseconds |
| `priority` | `number` | No | Priority level (higher numbers = higher priority) |

## Usage Examples

### Basic Notifications

```tsx
function BasicExample() {
  const notify = useNotification();

  return (
    <button onClick={() => notify({ message: 'Simple notification' })}>
      Show Notification
    </button>
  );
}
```

### Multiple Notifications with Different Priorities

```tsx
function PriorityExample() {
  const notify = useNotification();

  const showMultiple = () => {
    notify({
      message: 'High priority alert',
      severity: 'error',
      priority: 3
    });
    notify({
      message: 'Medium priority warning',
      severity: 'warning',
      priority: 2
    });
    notify({
      message: 'Low priority info',
      severity: 'info',
      priority: 1
    });
  };

  return <button onClick={showMultiple}>Show Multiple</button>;
}
```

### Custom Configuration

```tsx
function ConfigExample() {
  return (
    <NotificationProvider
      maxVisible={2}
      position={{ vertical: 'top', horizontal: 'right' }}
      defaultDuration={3000}
    >
      <YourApp />
    </NotificationProvider>
  );
}
```

## Queue Management

The system automatically manages notifications based on:
1. Maximum visible notifications limit
2. Priority levels
3. Last-in-first-out (LIFO) for equal priorities

Higher priority notifications will interrupt and replace lower priority ones when the maximum visible limit is reached.

## Accessibility

The notification system follows WAI-ARIA guidelines:

- Notifications container has role="log" and aria-live="polite"
- Individual notifications have role="alert" and aria-live="assertive"
- Close buttons have proper aria-label
- Focus management for keyboard navigation
- Screen reader friendly updates

## Migration Guide

### Migration Overview and Rationale

The new Notification API replaces legacy "Error-prefixed" notification components and ad-hoc notification calls with a unified, extensible, and accessible system. This migration enables:
- Consistent notification handling across the application
- Improved accessibility and user experience
- Priority-based queueing and flexible configuration
- Easier maintenance and future enhancements

### Step-by-Step Migration Instructions

#### 1. Update Imports

Replace imports of legacy notification components or utilities (e.g., `ErrorNotification`, `showErrorNotification`, `showNotification`) with the new API:

```diff
- import { showErrorNotification } from '.../old/path';
+ import { useNotification } from './NotificationProvider';
```

#### 2. Refactor Notification Usage

- Replace direct calls to legacy notification functions:

```diff
- showErrorNotification('An error occurred');
+ const notify = useNotification();
+ notify({ message: 'An error occurred', severity: 'error' });
```

- For generic notifications:

```diff
- showNotification('Message');
+ notify({ message: 'Message' });
```

- For custom durations:

```diff
- showNotification('Message', 3000);
+ notify({ message: 'Message', duration: 3000 });
```

#### 3. Update Provider Usage

Replace any usage of old notification providers (e.g., `SimpleNotificationProvider`, `ErrorNotificationProvider`) with the new `NotificationProvider`:

```diff
- <SimpleNotificationProvider>
+ <NotificationProvider maxVisible={3}>
    {/* ... */}
  </NotificationProvider>
```

#### 4. Update Configuration

- Set `maxVisible`, `position`, and `defaultDuration` as needed in `NotificationProvider`.
- Use the `priority` and `severity` options for advanced notification control.

#### 5. Remove Deprecated Components

- Remove all references to legacy notification components and utilities from your codebase.

### Migration Verification Checklist

- [ ] All imports of legacy notification utilities/components are removed
- [ ] All notification calls use the `useNotification` hook and `notify` function
- [ ] The application is wrapped in a single `NotificationProvider`
- [ ] Notification configuration matches application requirements
- [ ] No runtime warnings or errors related to deprecated notification APIs
- [ ] All notification types (success, info, warning, error) display correctly
- [ ] Accessibility features (screen reader, keyboard navigation) are verified

### Deprecation and Removal Timeline

- **Phase 5:** Deprecation warnings are shown when using legacy notification APIs.
- **Phase 6:** Legacy notification APIs will be removed in the next major release.
- **Recommendation:** Complete migration and verification before upgrading to the next major version.

#### Monitoring and Issue Reporting

- Monitor application logs for deprecation warnings.
- Test all notification scenarios after migration.
- Report any issues to the maintainers or via the project issue tracker.

## Best Practices

1. **Priority Levels**
   - Use priorities 1-3 for standard notifications
   - Reserve 4-5 for critical system messages
   - Default to priority 1 for general information

2. **Duration Guidelines**
   - Error messages: 8000ms or manual dismiss
   - Warnings: 5000ms
   - Success/Info: 3000ms
   - Critical alerts: Manual dismiss only

3. **Message Content**
   - Keep messages concise and clear
   - Use severity levels appropriately
   - Include actionable information when relevant

4. **Accessibility Considerations**
   - Provide meaningful messages for screen readers
   - Ensure sufficient color contrast
   - Support keyboard navigation
   - Allow adequate time for reading before auto-dismiss
