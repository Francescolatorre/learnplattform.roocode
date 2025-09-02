// Added act import
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import NotificationDemo from './NotificationDemo';
import type { NotificationContextType } from './types';

const mockAddNotification = vi.fn();
const mockDismissNotification = vi.fn();

vi.mock('./NotificationProvider', () => ({
  useNotificationContext: () => ({
    addNotification: mockAddNotification,
    dismissNotification: mockDismissNotification,
  }),
}));

describe('NotificationDemo', () => {
  beforeEach(() => {
    mockAddNotification.mockClear();
    mockDismissNotification.mockClear();
  });

  it('renders all notification control buttons', () => {
    render(<NotificationDemo />);

    expect(screen.getByText('Add Error')).toBeInTheDocument();
    expect(screen.getByText('Add Warning')).toBeInTheDocument();
    expect(screen.getByText('Add Info')).toBeInTheDocument();
    expect(screen.getByText('Add Success')).toBeInTheDocument();
    expect(screen.getByText('Test Priority Order')).toBeInTheDocument();
    expect(screen.getByText('Test Queue Management')).toBeInTheDocument();
    expect(screen.getByText('Test Error Handling')).toBeInTheDocument();
  });

  it('shows configuration controls', () => {
    render(<NotificationDemo />);

    expect(screen.getByLabelText('Vertical Position')).toBeInTheDocument();
    expect(screen.getByLabelText('Horizontal Position')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration (ms)')).toBeInTheDocument();
  });

  it('triggers basic notifications with correct severity', () => {
    render(<NotificationDemo />);

    act(() => {
      fireEvent.click(screen.getByText('Add Error'));
    });
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        title: 'Error',
      })
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Success'));
    });
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        title: 'Success',
      })
    );
  });

  it('handles multiple notifications with priorities', () => {
    render(<NotificationDemo />);

    act(() => {
      fireEvent.click(screen.getByText('Test Priority Order'));
    });

    expect(mockAddNotification).toHaveBeenCalledTimes(3);
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 3,
        title: 'High Priority',
      })
    );
  });

  it('handles queue overflow test', () => {
    render(<NotificationDemo />);

    act(() => {
      fireEvent.click(screen.getByText('Test Queue Management'));
    });

    expect(mockAddNotification).toHaveBeenCalledTimes(5);
    expect(mockAddNotification).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: 'Notification 5 in queue',
      })
    );
  });

  it('handles duration changes', () => {
    render(<NotificationDemo />);

    const durationInput = screen.getByLabelText('Duration (ms)');
    act(() => {
      fireEvent.change(durationInput, { target: { value: '3000' } });
    });

    act(() => {
      fireEvent.click(screen.getByText('Add Info'));
    });

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 3000,
      })
    );
  });

  it('handles error cases', () => {
    render(<NotificationDemo />);

    act(() => {
      fireEvent.click(screen.getByText('Test Error Handling'));
    });

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error: Invalid duration value',
        severity: 'error',
      })
    );
  });
});
