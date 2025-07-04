import {render, screen, act, fireEvent} from '@testing-library/react';
import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import React from 'react';
import {NotificationProvider, useNotificationContext} from './NotificationProvider';
import {NotificationSeverity} from './types';

describe('NotificationSystem Integration', () => {
    const TestComponent = () => {
        const {addNotification} = useNotificationContext();
        const notifications = [
            {message: 'Info notification', severity: 'info' as NotificationSeverity, priority: 1},
            {message: 'Warning notification', severity: 'warning' as NotificationSeverity, priority: 2},
            {message: 'Error notification', severity: 'error' as NotificationSeverity, priority: 3}
        ];

        return (
            <div>
                {notifications.map((notification, index) => (
                    <button
                        key={index}
                        data-testid={`add-${notification.severity}`}
                        onClick={() => addNotification(notification)}
                    >
                        Add {notification.severity}
                    </button>
                ))}
            </div>
        );
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    const renderNotificationSystem = (maxVisible = 3) => {
        return render(
            <NotificationProvider maxVisible={maxVisible}>
                <TestComponent />
            </NotificationProvider>
        );
    };

    it('displays and stacks multiple notifications based on priority', () => {
        renderNotificationSystem();

        // Add notifications in different order than their priorities
        act(() => {
            screen.getByTestId('add-info').click();
            screen.getByTestId('add-error').click();
            screen.getByTestId('add-warning').click();
        });

        const alerts = screen.getAllByRole('alert');
        expect(alerts).toHaveLength(3);

        // Verify priority ordering (error -> warning -> info)
        expect(alerts[0]).toHaveTextContent('Error notification');
        expect(alerts[1]).toHaveTextContent('Warning notification');
        expect(alerts[2]).toHaveTextContent('Info notification');
    });

    it('respects maxVisible limit and queues additional notifications', () => {
        const {container} = renderNotificationSystem(2);

        // Add three notifications
        act(() => {
            screen.getByTestId('add-info').click();
            screen.getByTestId('add-warning').click();
            screen.getByTestId('add-error').click();
        });

        // Should only show two highest priority notifications
        const visibleAlerts = screen.getAllByRole('alert');
        expect(visibleAlerts).toHaveLength(2);
        expect(visibleAlerts[0]).toHaveTextContent('Error notification');
        expect(visibleAlerts[1]).toHaveTextContent('Warning notification');

        // Dismiss highest priority notification
        const dismissButtons = container.querySelectorAll<HTMLButtonElement>('button[aria-label="close"]');
        act(() => {
            dismissButtons[0].click();
        });

        // Info notification should now be visible
        const updatedAlerts = screen.getAllByRole('alert');
        expect(updatedAlerts).toHaveLength(2);
        expect(updatedAlerts[0]).toHaveTextContent('Warning notification');
        expect(updatedAlerts[1]).toHaveTextContent('Info notification');
    });

    it('animates notifications and handles transitions correctly', () => {
        const {container} = renderNotificationSystem();

        // Add a notification
        act(() => {
            screen.getByTestId('add-info').click();
        });

        // Verify Snackbar transition classes
        const snackbar = container.querySelector('.MuiSnackbar-root');
        expect(snackbar).toHaveClass('MuiSnackbar-root');

        // Auto-dismiss after duration
        act(() => {
            vi.advanceTimersByTime(6000); // Default duration
        });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('maintains accessibility requirements when managing multiple notifications', () => {
        renderNotificationSystem();

        act(() => {
            screen.getByTestId('add-error').click();
            screen.getByTestId('add-warning').click();
        });

        // Verify notifications container
        const notificationsContainer = screen.getByRole('log');
        expect(notificationsContainer).toHaveAttribute('aria-live', 'polite');
        expect(notificationsContainer).toHaveAttribute('aria-label', 'Notifications');

        // Verify individual alerts
        const alerts = screen.getAllByRole('alert');
        alerts.forEach(alert => {
            expect(alert).toHaveAttribute('aria-live', 'assertive');
            expect(alert).toHaveAttribute('aria-atomic', 'true');
        });

        // Verify close buttons
        const closeButtons = screen.getAllByLabelText('close');
        expect(closeButtons).toHaveLength(2);
        closeButtons.forEach(button => {
            expect(button).toHaveAttribute('aria-label', 'close');
        });
    });

    it('supports backward compatibility with simple notification calls', () => {
        const SimpleNotificationTest = () => {
            const {addNotification} = useNotificationContext();
            React.useEffect(() => {
                addNotification({message: 'Simple notification'});
            }, [addNotification]);
            return null;
        };

        render(
            <NotificationProvider maxVisible={3}>
                <SimpleNotificationTest />
            </NotificationProvider>
        );

        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Simple notification');
        expect(alert).toBeInTheDocument();
    });

    it('manages concurrent notification operations correctly', () => {
        const {container} = renderNotificationSystem(2);

        // Rapidly add and dismiss notifications
        act(() => {
            screen.getByTestId('add-error').click();
            screen.getByTestId('add-warning').click();
            screen.getByTestId('add-info').click();
        });

        const initialAlerts = screen.getAllByRole('alert');
        expect(initialAlerts).toHaveLength(2);

        // Dismiss notifications while adding new ones
        const dismissButtons = container.querySelectorAll<HTMLButtonElement>('button[aria-label="close"]');
        act(() => {
            dismissButtons[0].click();
            screen.getByTestId('add-error').click();
        });

        const updatedAlerts = screen.getAllByRole('alert');
        expect(updatedAlerts).toHaveLength(2);
    });
});
