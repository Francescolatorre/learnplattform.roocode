import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {ErrorProvider} from './ErrorProvider';
import {useErrorNotifier} from './useErrorNotifier';

const TestComponent: React.FC = () => {
    const notifyError = useErrorNotifier();
    return (
        <button
            onClick={() =>
                notifyError({
                    message: 'Test error message',
                    title: 'Test Error',
                    severity: 'error',
                    duration: 2000,
                })
            }
        >
            Trigger Error
        </button>
    );
};

describe('Error Notification System', () => {
    it('renders error toast when error is triggered', async () => {
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );
        fireEvent.click(screen.getByText('Trigger Error'));
        expect(await screen.findByRole('alert')).toHaveTextContent('Test error message');
        expect(screen.getByText('Test Error')).toBeInTheDocument();
    });

    it('auto-dismisses error after duration', async () => {
        jest.useFakeTimers();
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );
        fireEvent.click(screen.getByText('Trigger Error'));
        expect(await screen.findByRole('alert')).toBeInTheDocument();
        jest.advanceTimersByTime(2100);
        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
        jest.useRealTimers();
    });

    it('allows manual dismiss via close button', async () => {
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );
        fireEvent.click(screen.getByText('Trigger Error'));
        const closeButton = await screen.findByLabelText(/close/i);
        fireEvent.click(closeButton);
        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('supports multiple concurrent toasts', async () => {
        render(
            <ErrorProvider>
                <TestComponent />
            </ErrorProvider>
        );
        fireEvent.click(screen.getByText('Trigger Error'));
        fireEvent.click(screen.getByText('Trigger Error'));
        expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(1);
    });
});
