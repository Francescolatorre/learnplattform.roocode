import React, {ReactElement} from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            cacheTime: 0,
        },
    },
});

const AllProviders = ({children}: {children: React.ReactNode}) => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
    );
};

const renderWithProviders = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => {
    return render(ui, {wrapper: AllProviders, ...options});
};

export * from '@testing-library/react';
export {renderWithProviders as render};
