import React, {createContext, useCallback, useContext, useRef, useState} from 'react';
import {ErrorToast} from './ErrorToast';
import {ErrorNotification, ErrorNotifierContextType} from './types';

const ErrorNotifierContext = createContext<ErrorNotifierContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [errors, setErrors] = useState<ErrorNotification[]>([]);
    const idCounter = useRef(0);

    const addError = useCallback((error: Omit<ErrorNotification, 'id'>) => {
        setErrors((prev) => [
            ...prev,
            {...error, id: idCounter.current++}
        ]);
    }, []);

    const dismissError = useCallback((id: number) => {
        setErrors((prev) => prev.filter((err) => err.id !== id));
    }, []);

    return (
        <ErrorNotifierContext.Provider value={{addError, dismissError}}>
            {children}
            <ErrorToast errors={errors} onDismiss={dismissError} />
        </ErrorNotifierContext.Provider>
    );
};

export const useErrorNotifierContext = (): ErrorNotifierContextType => {
    const ctx = useContext(ErrorNotifierContext);
    if (!ctx) {
        throw new Error('useErrorNotifierContext must be used within an ErrorProvider');
    }
    return ctx;
};
