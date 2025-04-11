/**
 * ErrorToast.tsx
 * Material UI-based error toast component for centralized error notification.
 * Fully accessible, extensible, and references ADR-012.
 */

import React, {useEffect, useRef} from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, {AlertProps} from "@mui/material/Alert";
import {useErrorNotifier} from "../../context/notifications/ErrorNotificationContext";

// Extensible for future notification types
const ALERT_SEVERITY = {
    error: "error",
    // success: "success",
    // warning: "warning",
    // info: "info",
} as const;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return (
        <MuiAlert
            elevation={6}
            ref={ref}
            variant="filled"
            {...props}
            // Accessibility: role and aria-live
            role="alert"
            aria-live="assertive"
            tabIndex={0}
        />
    );
});

const ErrorToast: React.FC = () => {
    const {notificationState, close} = useErrorNotifier();
    const {open, notification, type} = notificationState;
    const alertRef = useRef<HTMLDivElement>(null);

    // Focus management for accessibility
    useEffect(() => {
        if (open && alertRef.current) {
            alertRef.current.focus();
        }
    }, [open, notification]);

    // Keyboard: allow ESC to dismiss
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            close();
        }
    };

    return (
        <Snackbar
            open={open}
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            autoHideDuration={8000}
            onClose={close}
            // Accessibility: announce to screen readers
            aria-live="assertive"
            aria-describedby="error-toast-message"
        >
            <Alert
                ref={alertRef}
                severity={ALERT_SEVERITY[type]}
                onClose={close}
                onKeyDown={handleKeyDown}
                id="error-toast-message"
                sx={{minWidth: 320}}
                data-testid="error-toast"
            >
                {notification?.message}
                {notification?.actions}
            </Alert>
        </Snackbar>
    );
};

export default ErrorToast;

// ADR-012: Implementation aligns with centralized error notification system architectural decision.
