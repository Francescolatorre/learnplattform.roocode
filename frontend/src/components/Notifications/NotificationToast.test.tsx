import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

import { NotificationToast } from './NotificationToast';
import { INotification } from './types';

describe('NotificationToast', () => {
  const mockDismiss = vi.fn();
  const defaultPosition = { vertical: 'bottom' as const, horizontal: 'right' as const };

  const createNotification = (id: number, message: string, priority = 1): INotification => ({
    id,
    message,
    priority,
    severity: 'info',
    duration: 6000,
  });

  beforeEach(() => {
    mockDismiss.mockClear();
  });

  it('renders multiple notifications in a stack', () => {
    const notifications = [
      createNotification(1, 'First notification'),
      createNotification(2, 'Second notification'),
      createNotification(3, 'Third notification'),
    ];

    act(() => {
      render(
        <NotificationToast
          notifications={notifications}
          onDismiss={mockDismiss}
          position={defaultPosition}
        />
      );
    });

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
    expect(alerts[0]).toHaveTextContent('First notification');
    expect(alerts[1]).toHaveTextContent('Second notification');
    expect(alerts[2]).toHaveTextContent('Third notification');

    // Verify notifications are properly contained in an accessible log
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('maintains correct spacing between notifications', () => {
    const notifications = [createNotification(1, 'First'), createNotification(2, 'Second')];

    let container: HTMLElement;
    act(() => {
      const result = render(
        <NotificationToast
          notifications={notifications}
          onDismiss={mockDismiss}
          position={defaultPosition}
        />
      );
      container = result.container;
    });

    // Verify notifications are rendered in the correct order
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent('First');
    expect(alerts[1]).toHaveTextContent('Second');

    // Verify snackbars are rendered with correct position class
    const snackbars = container!.querySelectorAll('.MuiSnackbar-root');
    snackbars.forEach(snackbar => {
      expect(snackbar).toHaveClass('MuiSnackbar-anchorOriginBottomRight');
    });
  });

  it('handles notification dismissal', () => {
    const notifications = [createNotification(1, 'Test notification')];

    act(() => {
      render(
        <NotificationToast
          notifications={notifications}
          onDismiss={mockDismiss}
          position={defaultPosition}
        />
      );
    });

    const closeButton = screen.getByLabelText('close');
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(mockDismiss).toHaveBeenCalledWith(1);
  });

  it('ignores clickaway events', () => {
    const notifications = [createNotification(1, 'Test notification')];

    let container: HTMLElement;
    act(() => {
      const result = render(
        <NotificationToast
          notifications={notifications}
          onDismiss={mockDismiss}
          position={defaultPosition}
        />
      );
      container = result.container;
    });

    // Find and trigger Snackbar onClose with clickaway reason
    const snackbar = container!.querySelector('.MuiSnackbar-root');
    // @ts-ignore - Accessing private prop for testing
    act(() => {
      snackbar?.__ON_CLOSE?.({}, 'clickaway');
    });

    expect(mockDismiss).not.toHaveBeenCalled();
  });

  it('maintains accessibility requirements', () => {
    const notifications = [
      createNotification(1, 'First notification'),
      createNotification(2, 'Second notification'),
    ];

    act(() => {
      render(
        <NotificationToast
          notifications={notifications}
          onDismiss={mockDismiss}
          position={defaultPosition}
        />
      );
    });

    // Verify log region exists
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
    expect(log).toHaveAttribute('aria-label', 'Notifications');

    // Verify each alert is properly labeled
    const alerts = screen.getAllByRole('alert');
    alerts.forEach(alert => {
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    // Verify close buttons are properly labeled
    const closeButtons = screen.getAllByLabelText('close');
    expect(closeButtons).toHaveLength(2);
  });

  it('supports different positions', () => {
    const notifications = [createNotification(1, 'Test')];
    const position = { vertical: 'top' as const, horizontal: 'left' as const };

    act(() => {
      render(
        <NotificationToast
          notifications={notifications}
          onDismiss={mockDismiss}
          position={position}
        />
      );
    });

    const snackbar = screen.getByRole('alert').closest('.MuiSnackbar-root');
    expect(snackbar).toHaveClass('MuiSnackbar-anchorOriginTopLeft');
  });

  it('renders nothing when there are no notifications', () => {
    act(() => {
      render(
        <NotificationToast notifications={[]} onDismiss={mockDismiss} position={defaultPosition} />
      );
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
