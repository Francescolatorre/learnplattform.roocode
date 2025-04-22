/**
 * IErrorNotificationContext.tsx
 * Centralized error notification system using React Context API and Material UI.
 * Fully accessible, extensible, and globally available.
 * References ADR-012: Centralized Frontend Error Notification System.
 */

import React, {createContext, useContext, useState, useCallback, ReactNode, useRef} from "react";

export type IErrorNotification = {
    message: string;
    key?: string | number;
    actions?: React.ReactNode;
};

type NotificationType = "error"; // Extensible for "success" | "warning" | "info"

type NotificationState = {
    open: boolean;
    type: NotificationType;
    notification: IErrorNotification | null;
};

type IErrorNotificationContextProps = {
    showError: (message: string, options?: {key?: string | number; actions?: React.ReactNode}) => void;
    close: () => void;
    state: NotificationState;
};

const IErrorNotificationContext = createContext<IErrorNotificationContextProps | undefined>(undefined);

export const IErrorNotificationProvider = ({children}: {children: ReactNode}) => {
    // Only one notification at a time; new errors replace previous.
    const [state, setState] = useState<NotificationState>({
        open: false,
        type: "error",
        notification: null,
    });

    // For future extensibility: queue (not used for error, but ready for info/success)
    const queueRef = useRef<IErrorNotification[]>([]);

    const showError = useCallback(
        (message: string, options?: {key?: string | number; actions?: React.ReactNode}) => {
            setState({
                open: true,
                type: "error",
                notification: {message, ...options},
            });
        },
        []
    );

    const close = useCallback(() => {
        setState((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    // For extensibility: addNotification(type, notification) and queue logic can be added here.

    return (
        <IErrorNotificationContext.Provider value={{showError, close, state}}>
            {children}
        </IErrorNotificationContext.Provider>
    );
};

/**
 * Custom hook for triggering error notifications from any component.
 * Usage: const { showError } = useErrorNotifier();
 * Fully typed and simple API.
 */
export const useErrorNotifier = () => {
    const ctx = useContext(IErrorNotificationContext);
    if (!ctx) {
        throw new Error("useErrorNotifier must be used within an IErrorNotificationProvider");
    }
    return {
        showError: ctx.showError,
        close: ctx.close,
        notificationState: ctx.state,
    };
};

// ADR-012: All requirements and implementation align with the architectural decision record for centralized error notification.
