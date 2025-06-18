import CloseIcon from '@mui/icons-material/Close';
import {Snackbar, Alert, AlertTitle, IconButton} from '@mui/material';
import React from 'react';

import {INotification} from './types';

interface NotificationToastProps {
    notifications: INotification[];
    onDismiss: (id: number) => void;
}

/**
 * NotificationToast
 * Displays the first notification in the queue as a Material UI Snackbar.
 * Only one toast is visible at a time to reduce noise.
 */
export const NotificationToast: React.FC<NotificationToastProps> = ({notifications, onDismiss}) => {
    const notification = notifications[0];
    if (!notification) return null;

    // Use the appropriate variant based on severity to ensure class-based test selectors work
    const variant = notification.severity === 'success' ? 'standard' : 'filled';

    return (
        <Snackbar
            open
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            autoHideDuration={notification.duration ?? 6000}
            onClose={(_, reason) => {
                if (reason !== 'clickaway') onDismiss(notification.id);
            }}
            sx={{
                position: 'fixed',
                zIndex: (theme) => theme.zIndex.snackbar,
                bottom: 24,
                right: 24,
                maxWidth: 400,
                width: '100%',
                pointerEvents: 'auto',
            }}
            aria-live="assertive"
            aria-atomic="true"
        >
            <Alert
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
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
                role="alert"
                sx={{alignItems: 'center', minWidth: 300}}
                data-testid={`notification-${notification.severity || 'error'}`}
            >
                {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

// ---- Backward compatibility export ----
export {NotificationToast as ErrorToast};
// ADR-012: Centralized error notification system, only one error visible at a time.
