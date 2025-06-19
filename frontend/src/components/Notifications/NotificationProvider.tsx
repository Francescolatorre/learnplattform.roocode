import React, {createContext, useCallback, useContext, useRef, useState} from 'react';

import {NotificationToast} from './NotificationToast';
import {INotification, NotificationContextType} from './types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider for the notification system. Maintains a list of notifications
 * and exposes methods for adding and dismissing them.
 */
export interface NotificationProviderProps {
    children: React.ReactNode;
    /** Maximum number of visible notifications. Defaults to 3. */
    maxVisible?: number;
    /** Snackbar position. Defaults to bottom-right. */
    position?: {vertical: 'top' | 'bottom'; horizontal: 'left' | 'right'};
    /** Default duration if not specified on notification. */
    defaultDuration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    maxVisible = 3,
    position = {vertical: 'bottom', horizontal: 'right'},
    defaultDuration = 6000,
}) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const idCounter = useRef(0);

    const addNotification = useCallback(
        (notification: Omit<INotification, 'id'>) => {
            setNotifications((prev) => {
                const newNotif: INotification = {
                    ...notification,
                    id: idCounter.current++,
                    duration:
                        notification.duration === undefined
                            ? defaultDuration
                            : notification.duration,
                };
                return [...prev, newNotif].sort(
                    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
                );
            });
        },
        [defaultDuration]
    );

    const dismissNotification = useCallback((id: number) => {
        setNotifications((prev) => {
            const notif = prev.find((n) => n.id === id);
            if (notif?.onClose) notif.onClose();
            return prev.filter((err) => err.id !== id);
        });
    }, []);

    return (
        <NotificationContext.Provider value={{addNotification, dismissNotification}}>
            {children}
            <NotificationToast
                notifications={notifications.slice(0, maxVisible)}
                onDismiss={dismissNotification}
                position={position}
            />
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
