export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

export interface IErrorNotification {
    id: number;
    message: string;
    title?: string;
    severity?: ErrorSeverity;
    duration?: number; // ms, optional, for auto-dismiss
    // Add more fields as needed for extensibility (e.g., actions, debug info)
}

export interface ErrorNotifierContextType {
    addError: (error: Omit<IErrorNotification, 'id'>) => void;
    dismissError: (id: number) => void;
}
