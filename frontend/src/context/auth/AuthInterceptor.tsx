import React, {useEffect} from 'react';

/**
 * These imports are temporarily commented out but will be needed
 * for the upcoming session expiration handling feature
 */
// import {authEventService} from './AuthEventService';
// import {AuthEventType} from './AuthEventService';

import {AuthInterceptorProps} from './types';

// Keine Abhängigkeit mehr zu AuthContext!
export const AuthInterceptor: React.FC<AuthInterceptorProps> = ({
    onAuthFailure,
    onRefreshToken
}) => {
    useEffect(() => {
        // Setup API-Interceptors (z.B. mit axios)
        const setupInterceptors = () => {
            // Beispiel mit axios:
            // axios.interceptors.response.use(
            //   (response) => response,
            //   async (error) => {
            //     if (error.response?.status === 401) {
            //       try {
            //         const newToken = await onRefreshToken();
            //         if (newToken) {
            //           // Token zur ursprünglichen Anfrage hinzufügen und wiederholen
            //           error.config.headers.Authorization = `Bearer ${newToken}`;
            //           return axios(error.config);
            //         }
            //       } catch (refreshError) {
            //         authEventService.publish({ type: AuthEventType.AUTH_ERROR });
            //         onAuthFailure();
            //       }
            //     }
            //     return Promise.reject(error);
            //   }
            // );
        };

        setupInterceptors();
    }, [onAuthFailure, onRefreshToken]);

    // Der Interceptor rendert nichts, er fügt nur Logik hinzu
    return null;
};

// Remove unused imports or comment them for future use
// import { ... } from '...';
// import {authEventService} from './AuthEventService';
// import {AuthEventType} from './AuthEventService';

// Add commented explanation why imports are kept but not used
// These imports will be used in a future implementation for session expiration handling
// import {authEventService} from './AuthEventService';
// import {AuthEventType} from './AuthEventService';

// Either use these imports or remove them
// import { authEventService, AuthEventType } from './AuthEventService';

// If they're needed later, keep them but mark them for future use
// Will be used in future implementation
// const authEventCallback = () => {
//   authEventService.emit(AuthEventType.SESSION_EXPIRED);
// };
