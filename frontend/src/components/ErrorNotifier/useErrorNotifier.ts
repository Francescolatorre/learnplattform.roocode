import {useCallback} from 'react';
import {useErrorNotifierContext} from './ErrorProvider';
import {ErrorNotification} from './types';

export function useErrorNotifier() {
    const {addError} = useErrorNotifierContext();

    // Optionally, allow for a more ergonomic API (e.g., just pass message)
    const notifyError = useCallback(
        (error: Omit<ErrorNotification, 'id'> | string) => {
            if (typeof error === 'string') {
                addError({message: error});
            } else {
                addError(error);
            }
        },
        [addError]
    );

    return notifyError;
}
