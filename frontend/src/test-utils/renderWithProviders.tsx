import React from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {ErrorProvider} from '../components/ErrorNotifier/ErrorProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * Wraps children in all required context providers for testing.
 * Extend this as more providers are needed.
 */
const Providers: React.FC<ProvidersProps> = ({children}) => {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorProvider>
                {children}
            </ErrorProvider>
        </QueryClientProvider>
    );
};

/**
 * Custom render function that wraps UI in Providers.
 * Use this in place of RTL's render in tests that require context.
 */
const renderWithProviders = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, {wrapper: Providers, ...options});

export * from '@testing-library/react';
export {renderWithProviders};
