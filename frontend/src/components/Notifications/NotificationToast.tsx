import CloseIcon from '@mui/icons-material/Close';
import { Snackbar, Alert, AlertTitle, IconButton, Box, Slide } from '@mui/material';
import React from 'react';

import { INotification } from './types';

interface NotificationToastProps {
  notifications: INotification[];
  onDismiss: (id: number) => void;
  position: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' };
  // container?: Element | null; // Removed, not supported by MUI Snackbar
}

/**
 * NotificationToast
 * Displays multiple notifications as stacked Material UI Snackbars.
 * Supports animations, accessibility, and proper positioning.
 */
export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
  position,
  // container, // Removed
}) => {
  // Calculate the base spacing for notifications
  const NOTIFICATION_HEIGHT = 64; // Base height of a notification
  const NOTIFICATION_GAP = 12; // Gap between notifications
  const NOTIFICATION_MARGIN = 24; // Margin from screen edge

  // Function to calculate offset for a notification at a given index
  const getNotificationOffset = (index: number): number => {
    return NOTIFICATION_MARGIN + index * (NOTIFICATION_HEIGHT + NOTIFICATION_GAP);
  };

  // Only render up to maxVisible notifications (enforced at the display layer)
  const visibleNotifications = notifications.slice(
    0, // fallback to 3 if not set
    typeof (window as any).NOTIFICATION_MAX_VISIBLE === 'number'
      ? (window as any).NOTIFICATION_MAX_VISIBLE
      : 3
  );

  return (
    <Box
      role="log"
      aria-label="Notifications"
      aria-live="polite"
      sx={{
        position: 'fixed',
        zIndex: theme => theme.zIndex.snackbar,
        bottom: position.vertical === 'bottom' ? 0 : undefined,
        top: position.vertical === 'top' ? 0 : undefined,
        right: position.horizontal === 'right' ? 0 : undefined,
        left: position.horizontal === 'left' ? 0 : undefined,
        pointerEvents: 'none',
      }}
    >
      {visibleNotifications.map((notification, index) => {
        // Use the appropriate variant based on severity
        const variant = notification.severity === 'success' ? 'standard' : 'filled';

        // Calculate positioning based on index and position
        const offset = getNotificationOffset(index);

        return (
          <Slide
            key={notification.id}
            direction={position.horizontal === 'right' ? 'left' : 'right'}
            in={true}
            mountOnEnter
            unmountOnExit
          >
            <Snackbar
              open
              anchorOrigin={position}
              autoHideDuration={notification.duration ?? 6000}
              onClose={(_, reason) => {
                if (reason !== 'clickaway') onDismiss(notification.id);
              }}
              sx={{
                position: 'absolute',
                [position.vertical]: offset,
                maxWidth: 400,
                width: '100%',
                pointerEvents: 'auto',
              }}
              aria-live="assertive"
              aria-atomic="true"
              // container={container} // Removed
            >
              <Alert
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                severity={notification.severity ?? 'error'}
                variant={variant}
                className={notification.severity === 'success' ? 'MuiAlert-standardSuccess' : ''}
                onClose={() => onDismiss(notification.id)}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => onDismiss(notification.id)}
                    data-testid="notification-close-btn"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
                data-testid="notification-toast"
              >
                {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
                {notification.message}
              </Alert>
            </Snackbar>
          </Slide>
        );
      })}
    </Box>
  );
};
