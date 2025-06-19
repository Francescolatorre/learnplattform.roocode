/** Severity levels for a notification. */
export type NotificationSeverity = 'error' | 'warning' | 'info' | 'success';

/**
 * Structure of a notification object.
 */
export interface INotification {
    /** Unique identifier assigned internally. */
    id: number;
    /** Message to display in the toast. */
    message: string;
    /** Optional title used as alert heading. */
    title?: string;
    /** Optional severity for styling. Defaults to 'error'. */
    severity?: NotificationSeverity;
    /** Optional duration for auto dismiss in milliseconds. */
    duration?: number;
    /** Optional priority to control display order. Higher appears first. */
    priority?: number;
    /** Callback when the notification is dismissed. */
    onClose?: () => void;
    // Additional fields can be added for actions, debugging, etc.
}

/**
 * Public API exposed by the notification context.
 */
export interface NotificationContextType {
    /** Enqueue a notification to be displayed. */
    addNotification: (error: Omit<INotification, 'id'>) => void;
    /** Dismiss an existing notification by id. */
    dismissNotification: (id: number) => void;
}

// ---- Backward compatibility aliases ----
export type ErrorSeverity = NotificationSeverity;
export interface IErrorNotification extends INotification {}
export interface ErrorNotifierContextType extends NotificationContextType {}
