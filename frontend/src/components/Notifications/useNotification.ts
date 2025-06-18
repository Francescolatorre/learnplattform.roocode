import {useCallback} from 'react';

import {useErrorNotifierContext} from './ErrorProvider';
import {IErrorNotification} from './types';

/**
 * useNotification
 * Generic notification hook for all severities (error, success, info, warning).
 */
function useNotification() {
    const {addError} = useErrorNotifierContext();

    const notify = useCallback(
        (
            notification: Omit<IErrorNotification, 'id'> | string,
            severity: 'error' | 'success' | 'info' | 'warning' = 'error'
        ) => {
            if (typeof notification === 'string') {
                addError({message: notification, severity});
            } else {
                addError({...notification, severity: notification.severity ?? severity});
            }
        },
        [addError]
    );

    return notify;
}

export {useNotification};
