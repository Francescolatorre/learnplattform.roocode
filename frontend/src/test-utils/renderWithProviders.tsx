import React from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {NotificationProvider} from '../components/Notifications/NotificationProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {MemoryRouter} from 'react-router-dom';

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * Wraps children in all required context providers for testing.
 * Extend this as more providers are needed.
 */
const queryClient = new QueryClient();
const Providers: React.FC<ProvidersProps> = ({children}) => (
    <MemoryRouter>
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>{children}</NotificationProvider>
        </QueryClientProvider>
    </MemoryRouter>
);

/**
 * Custom render function that wraps UI in Providers.
 * Use this in place of RTL's render in tests that require context.
 */
const renderWithProviders = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, {wrapper: Providers, ...options});

export * from '@testing-library/react';
export {renderWithProviders};
