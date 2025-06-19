// Unmock real notification system before any imports
import {vi} from 'vitest';
vi.unmock('./useNotification');
vi.unmock('./NotificationProvider');

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

// Import actual components instead of mocking the entire implementation
import {NotificationProvider} from './NotificationProvider';
import useNotification from './useNotification';

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
    // Setup fake timers for testing time-based behaviors
    beforeEach(() => {
        vi.useFakeTimers();
    });

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

        const alert = await screen.findByRole('alert', {hidden: true});
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('First error message');
        expect(screen.getByText('Error One')).toBeInTheDocument();
    });

    it('auto-dismisses error after duration', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        fireEvent.click(screen.getByTestId('error1'));

        await screen.findByRole('alert', {hidden: true});

        act(() => {
            vi.advanceTimersByTime(2100); // Just past the 2000ms duration
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert', {hidden: true})).not.toBeInTheDocument();
        });
    });

    it('allows manual dismiss via close button', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        fireEvent.click(screen.getByTestId('error1'));

        await screen.findByRole('alert', {hidden: true});

        // Find and click close button
        const closeButton = await screen.findByLabelText(/close/i, {selector: 'button'});
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByRole('alert', {hidden: true})).not.toBeInTheDocument();
        });
    });

    it('displays multiple notifications simultaneously', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        fireEvent.click(screen.getByTestId('error1'));
        const alert1 = await screen.findByRole('alert', {hidden: true});
        expect(alert1).toHaveTextContent('First error message');

        fireEvent.click(screen.getByTestId('error2'));
        const alert2 = await screen.findByRole('alert', {hidden: true});
        expect(alert2).toHaveTextContent('Second error message');
    });

    it('handles errors thrown during component rendering', async () => {
        // Create a component that triggers an error notification on mount
        const ErrorComponent = () => {
            const notifyError = useNotification();
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
        const alert = await screen.findByRole('alert', {hidden: true});
        expect(alert).toHaveTextContent('Error from component');
    });
});
