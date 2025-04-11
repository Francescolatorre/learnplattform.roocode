import {useEffect} from 'react';
import {AuthEvent} from './types';
import {authEventService} from './AuthEventService';

export const useAuthEvents = (callback: (event: AuthEvent) => void) => {
    useEffect(() => {
        const unsubscribe = authEventService.subscribe(callback);
        return () => unsubscribe();
    }, [callback]);
};
