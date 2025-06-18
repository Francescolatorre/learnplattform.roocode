import React, {createContext, useCallback, useContext, useRef, useState} from 'react';

import {NotificationToast} from './NotificationToast';
import {INotification, NotificationContextType} from './types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider for the notification system. Maintains a list of notifications
 * and exposes methods for adding and dismissing them.
 */
export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const idCounter = useRef(0);

    const addNotification = useCallback((notification: Omit<INotification, 'id'>) => {
        setNotifications((prev) => [
            ...prev,
            {...notification, id: idCounter.current++}
        ]);
    }, []);

    const dismissNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((err) => err.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{addNotification, dismissNotification}}>
            {children}
            <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
        </NotificationContext.Provider>
    );
};

/**
 * Access the notification context safely within components.
 */
export const useNotificationContext = (): NotificationContextType => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return ctx;
};

// ---- Backward compatibility exports ----
export {NotificationProvider as ErrorProvider};
export {useNotificationContext as useErrorNotifierContext};
export {NotificationToast as ErrorToast};
