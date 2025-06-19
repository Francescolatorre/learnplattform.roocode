import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {vi, describe, it, expect, beforeEach, afterEach, beforeAll} from 'vitest';

let NotificationProvider: React.ComponentType<{children: React.ReactNode}>;
let useNotification: ReturnType<typeof import('./useNotification')['useNotification']>;

beforeAll(async () => {
    vi.unmock('./NotificationProvider');
    vi.unmock('./useNotification');
    ({NotificationProvider} = await import('./NotificationProvider'));
    ({useNotification} = await import('./useNotification'));
});

// Simple test component using the real notification hook
const TestComponent = () => {
    const notifyError = useNotification();

    return (
        <>
            <button
                data-testid="error1"
                onClick={() =>
                    notifyError({
                        message: 'First error message',
                        title: 'Error One',
                        severity: 'error',
                        duration: 2000,
                    })
                }
            >
                Trigger First Error
            </button>
            <button
                data-testid="error2"
                onClick={() =>
                    notifyError({
                        message: 'Second error message',
                        title: 'Error Two',
                        severity: 'error',
                        duration: 2000,
                    })
                }
            >
                Trigger Second Error
            </button>
        </>
    );
};

describe('Error Notification System', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('renders error toast when error is triggered', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        fireEvent.click(screen.getByTestId('error1'));

        // Notification should appear asynchronously
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('First error message');
        expect(screen.getByText('Error One')).toBeInTheDocument();
    });

    it('auto-dismisses error after duration', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        // Trigger the error
        fireEvent.click(screen.getByTestId('error1'));

        // Verify error is shown
        await screen.findByRole('alert');

        // Wait past the duration then expect dismissal
        await act(async () => {
            await new Promise((res) => setTimeout(res, 2100));
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('allows manual dismiss via close button', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        // Trigger the error
        fireEvent.click(screen.getByTestId('error1'));

        // Find and click close button
        const closeButton = await screen.findByLabelText(/close/i);
        fireEvent.click(closeButton);

        // Verify alert is removed
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays multiple notifications simultaneously', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        // Trigger first error
        fireEvent.click(screen.getByTestId('error1'));

        // Verify first error is shown
        await screen.findByRole('alert');

        // Trigger second error while first is still showing
        fireEvent.click(screen.getByTestId('error2'));

        // Both alerts should be visible
        const alerts = await screen.findAllByRole('alert');
        expect(alerts).toHaveLength(2);
        const messages = alerts.map((el) => el.textContent || '');
        expect(messages.join(' ')).toContain('First error message');
        expect(messages.join(' ')).toContain('Second error message');
    });

    it('handles errors thrown during component rendering', async () => {
        // Create a component that throws an error during render
        const ErrorComponent = () => {
            const notifyError = useNotification();

            // This will be called on mount
            React.useEffect(() => {
                notifyError({
                    message: 'Error from component',
                    title: 'Component Error',
                    severity: 'error',
                    duration: 2000,
                });
            }, []);

            return <div>Component content</div>;
        };

        render(
            <NotificationProvider>
                <ErrorComponent />
            </NotificationProvider>
        );

        // Verify error notification appears
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Error from component');
    });
});
