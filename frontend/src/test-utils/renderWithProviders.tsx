import React from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {NotificationProvider} from '../components/Notifications/NotificationProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {MemoryRouter, MemoryRouterProps} from 'react-router-dom';
import {AuthProvider} from '../context/auth/AuthContext';

interface ProvidersProps {
    children: React.ReactNode;
    initialEntries?: MemoryRouterProps['initialEntries'];
}

/**
 * Wraps children in all required context providers for testing.
 * Extend this as more providers are needed.
 */
const Providers: React.FC<ProvidersProps> = ({children, initialEntries}) => {
    // Create a new QueryClient for each test to avoid cache leakage
    const queryClient = new QueryClient();
    return (
        <MemoryRouter initialEntries={initialEntries}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <NotificationProvider>{children}</NotificationProvider>
                </AuthProvider>
            </QueryClientProvider>
        </MemoryRouter>
    );
};

/**
 * Custom render function that wraps UI in Providers.
 * Use this in place of RTL's render in tests that require context.
 * Pass { initialEntries: [...] } as options to set the initial route.
 */
const renderWithProviders = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & {initialEntries?: MemoryRouterProps['initialEntries']}
) => {
    const {initialEntries, ...rest} = options || {};
    return render(ui, {
        wrapper: (props) => <Providers initialEntries={initialEntries} {...props} />,
        ...rest,
    });
};

export * from '@testing-library/react';
export {renderWithProviders};
