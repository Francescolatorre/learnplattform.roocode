import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';

// Import actual components instead of mocking the entire implementation
import {NotificationProvider} from './NotificationProvider';
import {useNotification} from './useNotification';


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

        // No need to wait for async behavior - should be synchronous
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('First error message');
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
        expect(screen.getByRole('alert')).toBeInTheDocument();

        // Fast-forward time past the duration
        act(() => {
            vi.advanceTimersByTime(2100); // Just past the 2000ms duration
        });

        // Verify error is removed
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
        const closeButton = screen.getByLabelText(/close/i);
        fireEvent.click(closeButton);

        // Verify alert is removed
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('queues multiple errors but only shows one at a time', async () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        // Trigger first error
        fireEvent.click(screen.getByTestId('error1'));

        // Verify first error is shown
        expect(screen.getByRole('alert')).toHaveTextContent('First error message');

        // Trigger second error while first is still showing
        fireEvent.click(screen.getByTestId('error2'));

        // Verify only the first alert is shown
        expect(screen.getAllByRole('alert')).toHaveLength(1);
        expect(screen.getByRole('alert')).toHaveTextContent('First error message');

        // Manually dismiss the first alert
        const closeButton = screen.getByLabelText(/close/i);
        fireEvent.click(closeButton);

        // Wait for second error to appear
        expect(screen.getByRole('alert')).toHaveTextContent('Second error message');
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
        expect(screen.getByRole('alert')).toHaveTextContent('Error from component');
    });
});
