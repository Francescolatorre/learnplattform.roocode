import { useEffect } from 'react';

import { authEventService } from './AuthEventService';
import { IAuthEvent } from './types';

export const useAuthEvents = (callback: (event: IAuthEvent) => void) => {
  useEffect(() => {
    const unsubscribe = authEventService.subscribe(callback);
    return () => unsubscribe();
  }, [callback]);
};
