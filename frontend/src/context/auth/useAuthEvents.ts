import { useEffect } from 'react';

import { authEventService } from './AuthEventService';
import { AuthEvent } from './types';

export const useAuthEvents = (callback: (event: AuthEvent) => void) => {
  useEffect(() => {
    const unsubscribe = authEventService.subscribe(callback);
    return () => unsubscribe();
  }, [callback]);
};
