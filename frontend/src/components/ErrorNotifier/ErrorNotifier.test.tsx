import React from 'react';
/* Mock MUI transitions to be immediate for tests */
vi.mock('@mui/material/Collapse', () => ({
    default: ({children}: any) => children
}));
vi.mock('@mui/material/Fade', () => ({
    default: ({children}: any) => children
}));
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
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

describe('Error Notification System', () => {
    it('renders error toast when error is triggered', async () => {
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );
        fireEvent.click(screen.getByTestId('error1'));
        expect(await screen.findByRole('alert')).toHaveTextContent('First error message');
        expect(screen.getByText('Error One')).toBeInTheDocument();
    });

    it.skip(
        'auto-dismisses error after duration',
        async () => {
            vi.useFakeTimers();
            render(
                <ErrorProvider>
                    <TestComponent />
                </ErrorProvider>
            );
            fireEvent.click(screen.getByTestId('error1'));
            expect(await screen.findByRole('alert')).toBeInTheDocument();
            await act(async () => {
                vi.advanceTimersByTime(2100);
                vi.runAllTimers();
            });
            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
            vi.useRealTimers();
        },
        10000 // 10s timeout
    );

    it(
        'allows manual dismiss via close button',
        async () => {
            render(
                <ErrorProvider>
                    <TestComponent />
                </ErrorProvider>
            );
            fireEvent.click(screen.getByTestId('error1'));
            const closeButton = await screen.findByLabelText(/close/i);
            await act(async () => {
                fireEvent.click(closeButton);
            });
            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        },
        10000 // 10s timeout
    );

    it(
        'queues multiple errors but only shows one at a time (ADR-012)',
        async () => {
            render(
                <ErrorProvider>
                    <TestComponent />
                </ErrorProvider>
            );

            // Trigger first error
            fireEvent.click(screen.getByTestId('error1'));

            // Wait for the first alert to appear
            const firstAlert = await screen.findByRole('alert');
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
            fireEvent.click(closeButton);

            // Wait for the first alert to be removed
            await waitFor(() => {
                expect(screen.queryByText('Error One')).not.toBeInTheDocument();
            });

            // The second alert should now appear
            await waitFor(() => {
                const alert = screen.getByRole('alert');
                expect(alert).toBeInTheDocument();
                expect(alert).toHaveTextContent('Second error message');
                expect(screen.getByText('Error Two')).toBeInTheDocument();
            });

            // Verify only one alert is shown
            const alerts = screen.getAllByRole('alert');
            expect(alerts.length).toBe(1);

            // Dismiss the second alert
            const closeButton2 = screen.getByLabelText(/close/i);
            fireEvent.click(closeButton2);

            // Wait for the second alert to be removed
            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        },
        10000 // 10s timeout
    );
});
