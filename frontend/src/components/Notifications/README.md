# Enhanced Notification System

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
3. First-in-first-out (FIFO) for equal priorities

Higher priority notifications will interrupt and replace lower priority ones when the maximum visible limit is reached.

## Accessibility

The notification system follows WAI-ARIA guidelines:

- Notifications container has role="log" and aria-live="polite"
- Individual notifications have role="alert" and aria-live="assertive"
- Close buttons have proper aria-label
- Focus management for keyboard navigation
- Screen reader friendly updates

## Migration Guide

### Upgrading from v1.x

1. Replace the old provider:

```diff
- <SimpleNotificationProvider>
+ <NotificationProvider maxVisible={3}>
```

2. Update notification calls:

```diff
- showNotification('Message');
+ notify({ message: 'Message' });
```

3. For duration customization:

```diff
- showNotification('Message', 3000);
+ notify({ message: 'Message', duration: 3000 });
```

4. For severity levels:

```diff
- showErrorNotification('Error occurred');
+ notify({ message: 'Error occurred', severity: 'error' });
```

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
