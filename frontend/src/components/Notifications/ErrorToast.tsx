import CloseIcon from '@mui/icons-material/Close';
import {Snackbar, Alert, AlertTitle, IconButton} from '@mui/material';
import React from 'react';

import {IErrorNotification} from './types';

interface ErrorToastProps {
    errors: IErrorNotification[];
    onDismiss: (id: number) => void;
}

/**
 * ErrorToast.tsx
 * Refactored for ADR-012 compliance: Only one error toast visible at a time.
 * New errors replace or queue previous ones.
 * Accessibility and extensibility preserved.
 */
export const ErrorToast: React.FC<ErrorToastProps> = ({errors, onDismiss}) => {
    const error = errors[0];
    if (!error) return null;

    // Use the appropriate variant based on severity to ensure class-based test selectors work
    const variant = error.severity === 'success' ? 'standard' : 'filled';

    return (
        <Snackbar
            open
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            autoHideDuration={error.duration ?? 6000}
            onClose={(_, reason) => {
                if (reason !== 'clickaway') onDismiss(error.id);
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
                severity={error.severity ?? 'error'}
                variant={variant}
                className={error.severity === 'success' ? 'MuiAlert-standardSuccess' : ''}
                onClose={() => onDismiss(error.id)}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => onDismiss(error.id)}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
                role="alert"
                sx={{alignItems: 'center', minWidth: 300}}
                data-testid={`notification-${error.severity || 'error'}`}
            >
                {error.title && <AlertTitle>{error.title}</AlertTitle>}
                {error.message}
            </Alert>
        </Snackbar>
    );
};
// ADR-012: Centralized error notification system, only one error visible at a time.
