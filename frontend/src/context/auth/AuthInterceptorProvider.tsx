/**
 * AuthInterceptorProvider
 *
 * A component that wraps the AuthInterceptor and connects it to the authentication system.
 * This component handles the integration between AuthContext and the axios interceptors.
 */
import React from 'react';
import {AuthInterceptor} from './AuthInterceptor';
import {useAuthInterceptor} from './useAuthInterceptor';

interface IAuthInterceptorProviderProps {
    children: React.ReactNode;
}

export const AuthInterceptorProvider: React.FC<IAuthInterceptorProviderProps> = ({children}) => {
    // Get the interceptor props from our custom hook
    const interceptorProps = useAuthInterceptor();

    return (
        <>
            {/* AuthInterceptor doesn't render anything visible, just sets up the interceptors */}
            <AuthInterceptor {...interceptorProps} />
            {children}
        </>
    );
};
