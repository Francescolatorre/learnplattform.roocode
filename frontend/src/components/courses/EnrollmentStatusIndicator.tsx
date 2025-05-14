import React from 'react';
import {Chip, Tooltip} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {useTheme} from '@mui/material/styles';

/**
 * Interface for EnrollmentStatusIndicator props
 */
interface IEnrollmentStatusIndicatorProps {
    /**
     * Whether the user is enrolled in the course
     */
    isEnrolled: boolean;

    /**
     * Whether to display in a compact mode (smaller chip)
     * @default false
     */
    compact?: boolean;

    /**
     * Whether the course is completed
     * @default false
     */
    isCompleted?: boolean;

    /**
     * Whether to show the "Not Enrolled" status (sometimes we only want to show when enrolled)
     * @default true
     */
    showNotEnrolled?: boolean;
}

/**
 * A component that displays the enrollment status of a course
 *
 * Shows different indicators for:
 * - Enrolled: Green chip with "Enrolled" text
 * - Completed: Green chip with "Completed" text
 * - Not Enrolled: Gray chip with "Not Enrolled" text (only if showNotEnrolled is true)
 *
 * @returns A visual indicator of course enrollment status
 */
const EnrollmentStatusIndicator: React.FC<IEnrollmentStatusIndicatorProps> = ({
    isEnrolled,
    compact = false,
    isCompleted = false,
    showNotEnrolled = true,
}) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    if (!isEnrolled && !showNotEnrolled) {
        return null;
    }

    // Determine chip props based on enrollment status
    const getChipProps = () => {
        if (isEnrolled) {
            if (isCompleted) {
                return {
                    label: 'Completed',
                    color: 'success' as const,
                    icon: <CheckCircleIcon />,
                    tooltip: 'You have completed this course',
                };
            }
            return {
                label: 'Enrolled',
                color: 'primary' as const,
                icon: <SchoolIcon />,
                tooltip: 'You are enrolled in this course',
            };
        }

        return {
            label: 'Not Enrolled',
            color: 'default' as const,
            icon: <AccessTimeIcon />,
            tooltip: 'You are not enrolled in this course',
        };
    };

    const {label, color, icon, tooltip} = getChipProps();

    // Always render as a chip for visual consistency
    return (
        <Tooltip title={tooltip} arrow placement="top">
            <Chip
                size={compact ? "small" : "medium"}
                label={label}
                color={color}
                icon={icon}
                sx={{
                    fontWeight: 'bold',
                    backgroundColor: isDarkMode
                        ? theme.palette[color === 'default' ? 'grey' : color]?.light || theme.palette.grey[300]
                        : theme.palette[color === 'default' ? 'grey' : color]?.dark || theme.palette.grey[700],
                    color: '#fff',
                    '& .MuiChip-icon': {
                        color: '#fff'  // Make icon same color as text
                    }
                }}
            />
        </Tooltip>
    );
};

export default EnrollmentStatusIndicator;
