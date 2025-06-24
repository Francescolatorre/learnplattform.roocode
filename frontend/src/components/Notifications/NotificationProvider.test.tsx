import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {NotificationProvider, useNotificationContext, resetIdCounter} from './NotificationProvider';
import type {INotification} from './types';

describe('NotificationProvider', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    function TestComponent({notification}: {notification?: Omit<INotification, 'id'>}) {
        const ctx = useNotificationContext();
        return (
            <div>
                <button data-testid="add" onClick={() => notification && ctx.addNotification(notification)}>
                    Add Notification
                </button>
                <button data-testid="dismiss" onClick={() => ctx.dismissNotification(0)}>
                    Dismiss First
                </button>
            </div>
        );
    }

    function renderWithProvider(
        ui: React.ReactNode,
        providerProps?: Partial<React.ComponentProps<typeof NotificationProvider>>
    ) {
        return render(
            <NotificationProvider {...providerProps}>{ui}</NotificationProvider>
        );
    }

    it('renders and provides context', () => {
        renderWithProvider(<TestComponent />);
        expect(screen.getByTestId('add')).toBeInTheDocument();
    });

    it('adds and displays a notification', async () => {
        renderWithProvider(<TestComponent notification={{message: 'Hello', severity: 'info'}} />);
        fireEvent.click(screen.getByTestId('add'));
        // Wait for notification to appear
        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });
    });

    it('dismisses a notification', async () => {
        renderWithProvider(<TestComponent notification={{message: 'Bye', severity: 'success'}} />);
        fireEvent.click(screen.getByTestId('add'));
        await waitFor(() => expect(screen.getByText('Bye')).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', {name: /close/i}));
        await waitFor(() => {
            expect(screen.queryByText('Bye')).not.toBeInTheDocument();
        });
    });

    it('respects maxVisible and queues notifications', async () => {
        // Use a harness to add notifications programmatically
        const notifications = [
            {message: 'N1', severity: 'info'},
            {message: 'N2', severity: 'info'},
            {message: 'N3', severity: 'info'},
            {message: 'N4', severity: 'info'}
        ];
        const Harness = React.forwardRef((_, ref: React.Ref<any>) => {
            const ctx = useNotificationContext();
            React.useImperativeHandle(ref, () => ctx, [ctx]);
            return null;
        });
        const harnessRef = React.createRef<any>();
        renderWithProvider(<Harness ref={harnessRef} />, {maxVisible: 2});

        // Add all notifications
        for (const n of notifications) {
            harnessRef.current.addNotification(n);
        }

        await waitFor(() => {
            expect(screen.getByText('N4')).toBeInTheDocument();
            expect(screen.getByText('N3')).toBeInTheDocument();
        });
        expect(screen.queryByText('N1')).not.toBeInTheDocument();
        expect(screen.queryByText('N2')).not.toBeInTheDocument();

        // Dismiss one, next newest in queue should appear (N2)
        fireEvent.click(screen.getAllByRole('button', { name: /close/i })[0]);
        await waitFor(() => {
            expect(screen.getByText('N2')).toBeInTheDocument();
            expect(screen.getByText('N3')).toBeInTheDocument();
        });
    });

    it('sorts notifications by priority', async () => {
        const Harness = React.forwardRef((_, ref: React.Ref<any>) => {
            const ctx = useNotificationContext();
            React.useImperativeHandle(ref, () => ctx, [ctx]);
            return null;
        });
        const harnessRef = React.createRef<any>();
        renderWithProvider(<Harness ref={harnessRef} />, {maxVisible: 2});

        harnessRef.current.addNotification({message: 'Low', severity: 'info', priority: 1});
        harnessRef.current.addNotification({message: 'High', severity: 'info', priority: 10});
        harnessRef.current.addNotification({message: 'Mid', severity: 'info', priority: 5});

        await waitFor(() => {
            // High and Mid should be visible
            expect(screen.getByText('High')).toBeInTheDocument();
            expect(screen.getByText('Mid')).toBeInTheDocument();
            expect(screen.queryByText('Low')).not.toBeInTheDocument();
        });
    });

    it('calls onClose callback when notification is dismissed', async () => {
        const onClose = vi.fn();
        const Harness = React.forwardRef((_, ref: React.Ref<any>) => {
            const ctx = useNotificationContext();
            React.useImperativeHandle(ref, () => ctx, [ctx]);
            return null;
        });
        const harnessRef = React.createRef<any>();
        renderWithProvider(<Harness ref={harnessRef} />, {maxVisible: 1});

        harnessRef.current.addNotification({message: 'Bye', severity: 'info', onClose});
        await waitFor(() => expect(screen.getByText('Bye')).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', {name: /close/i}));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('provides accessibility roles', async () => {
        renderWithProvider(<TestComponent notification={{message: 'A11y', severity: 'info'}} />);
        fireEvent.click(screen.getByTestId('add'));
        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
});
