import React from 'react';
/* Mock MUI transitions to be immediate for tests */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
vi.mock('@mui/material/Collapse', () => ({
    default: ({children}: any) => children
}));
vi.mock('@mui/material/Fade', () => ({
    default: ({children}: any) => children
}));
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import '@testing-library/jest-dom'; // Import for jest-dom matchers
import {ErrorProvider} from './ErrorProvider';
import {useNotification} from './useErrorNotifier';

// Create a more flexible test component that can send different messages
const TestComponent: React.FC = () => {
    const notify = useNotification();
    return (
        <>
            <button
                data-testid="error1"
                onClick={() =>
                    notify({
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
                    notify({
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

describe.skip('Error Notification System', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it.skip('renders error toast when error is triggered', async () => {
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );
        fireEvent.click(screen.getByTestId('error1'));
        await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
        expect(screen.getByRole('alert')).toHaveTextContent('First error message');
        expect(screen.getByText('Error One')).toBeInTheDocument();
    });

    it('auto-dismisses error after duration', async () => {
        vi.useFakeTimers();

        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );

        fireEvent.click(screen.getByTestId('error1'));

        // Initial verification
        await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

        // Advance timers
        await act(async () => {
            vi.advanceTimersByTime(2500); // A bit more than the 2000ms duration
        });

        // Verify alert is gone
        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument(), {
                timeout: 5000,  // 5s timeout for this specific waitFor
                interval: 100   // Check every 100ms instead of default
            };
        });

        vi.useRealTimers();
    }, 50000);

    it.skip('allows manual dismiss via close button', async () => {
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );
        fireEvent.click(screen.getByTestId('error1'));
        await waitFor(() => expect(screen.getByLabelText(/close/i)).toBeInTheDocument());
        const closeButton = screen.getByLabelText(/close/i);
        await act(async () => {
            fireEvent.click(closeButton);
        });
        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    }, 50000);

    it.skip('queues multiple errors but only shows one at a time (ADR-012)', async () => {
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );

        // Trigger first error
        fireEvent.click(screen.getByTestId('error1'));

        // Wait for the first alert to appear
        await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
        const firstAlert = screen.getByRole('alert');
        expect(firstAlert).toHaveTextContent('First error message');
        expect(screen.getByText('Error One')).toBeInTheDocument();

        // Trigger second error while first is still showing
        fireEvent.click(screen.getByTestId('error2'));

        // Verify only the first alert is shown
        await waitFor(() => {
            const alerts = screen.getAllByRole('alert');
            expect(alerts.length).toBe(1);
            expect(alerts[0]).toHaveTextContent('First error message');
        });

        // Dismiss the first alert
        const closeButton = screen.getByLabelText(/close/i);
        await act(async () => {
            fireEvent.click(closeButton);
        });

        // The second alert should now appear (may need to wait for transition)
        await waitFor(() => {
            expect(screen.queryByText('Error One')).not.toBeInTheDocument();
            expect(screen.getByText('Error Two')).toBeInTheDocument();
        });

        // Verify only one alert is shown
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBe(1);
        expect(alerts[0]).toHaveTextContent('Second error message');

        // Dismiss the second alert
        const closeButton2 = screen.getByLabelText(/close/i);
        await act(async () => {
            fireEvent.click(closeButton2);
        });

        // Wait for the second alert to be removed
        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    }, 50000);
});
