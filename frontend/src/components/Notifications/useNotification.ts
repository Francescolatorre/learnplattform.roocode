import {useCallback} from 'react';

import {useNotificationContext} from './NotificationProvider';
import {INotification} from './types';

/**
 * useNotification
 * Generic notification hook for all severities (error, success, info, warning).
 */
function useNotification() {
    const {addNotification} = useNotificationContext();

    const notify = useCallback(
        (
            notification: Omit<INotification, 'id'> | string,
            severity: 'error' | 'success' | 'info' | 'warning' = 'error'
        ) => {
            if (typeof notification === 'string') {
                addNotification({message: notification, severity});
            } else {
                addNotification({
                    ...notification,
                    severity: notification.severity ?? severity,
                });
            }
        },
        [addNotification]
    );

    const makeSeverityFn = (sev: 'error' | 'success' | 'info' | 'warning') =>
        (msg: Omit<INotification, 'id'> | string) => notify(msg, sev);

    return Object.assign(notify, {
        success: makeSeverityFn('success'),
        error: makeSeverityFn('error'),
        info: makeSeverityFn('info'),
        warning: makeSeverityFn('warning'),
    });
}

export {useNotification};
