import React from 'react';
import {Snackbar, Alert, AlertTitle, IconButton, Stack} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {ErrorNotification} from './types';

interface ErrorToastProps {
    errors: ErrorNotification[];
    onDismiss: (id: number) => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({errors, onDismiss}) => {
    // Stacked display: show all errors, each in its own Snackbar, offset vertically
    return (
        <Stack
            spacing={2}
            sx={{
                position: 'fixed',
                zIndex: (theme) => theme.zIndex.snackbar,
                bottom: 24,
                right: 24,
                maxWidth: 400,
                width: '100%',
                pointerEvents: 'none',
            }}
            aria-live="assertive"
            aria-atomic="true"
        >
            {errors.map((error, idx) => (
                <Snackbar
                    key={error.id}
                    open
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    autoHideDuration={error.duration ?? 6000}
                    onClose={(_, reason) => {
                        if (reason !== 'clickaway') onDismiss(error.id);
                    }}
                    sx={{
                        pointerEvents: 'auto',
                        mb: idx * 7, // offset each snackbar
                    }}
                >
                    <Alert
                        severity={error.severity ?? 'error'}
                        variant="filled"
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
                    >
                        {error.title && <AlertTitle>{error.title}</AlertTitle>}
                        {error.message}
                    </Alert>
                </Snackbar>
            ))}
        </Stack>
    );
};
