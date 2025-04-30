import React, {createContext, useContext, useMemo} from 'react';
import {AxiosInstance} from 'axios';
import {createApiClient} from '../../context/auth/AuthInterceptor';
import {ApiService} from './apiService';

// Create context for ApiService instead of raw AxiosInstance
const ApiServiceContext = createContext<ApiService<unknown> | undefined>(undefined);

// Provider component
export const ApiServiceProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    // Create the base axios instance
    const axiosInstance = useMemo(() => createApiClient(), []);

    // Create a shared ApiService instance using the configured axios instance
    const apiServiceInstance = useMemo(() => {
        const service = new ApiService();
        // Configure service with the authenticated axios instance
        service.setAxiosInstance(axiosInstance);
        return service;
    }, [axiosInstance]);

    return (
        <ApiServiceContext.Provider value={apiServiceInstance}>
            {children}
        </ApiServiceContext.Provider>
    );
};

// Hook for using the API service
export const useApiService = <T = unknown>(): ApiService<T> => {
    const context = useContext(ApiServiceContext);
    if (context === undefined) {
        throw new Error('useApiService must be used within an ApiServiceProvider');
    }
    return context as ApiService<T>;
};

// Keep the original context for backward compatibility
const ApiClientContext = createContext<AxiosInstance | undefined>(undefined);

export const ApiClientProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const apiClient = useMemo(() => createApiClient(), []);

    return (
        <ApiClientContext.Provider value={apiClient}>
            {children}
        </ApiClientContext.Provider>
    );
};

export const useApiClient = (): AxiosInstance => {
    const context = useContext(ApiClientContext);
    if (context === undefined) {
        throw new Error('useApiClient must be used within an ApiClientProvider');
    }
    return context;
};
