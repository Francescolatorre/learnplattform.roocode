import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
  colorMapping?: Record<string, StatusType>;
  labelMapping?: Record<string, string>;
  getColor?: (status: string) => StatusType;
  getLabel?: (status: string) => string;
}

/**
 * A reusable chip component for displaying status with appropriate colors
 */
const StatusChip: React.FC<StatusChipProps> = ({
  status,
  colorMapping,
  labelMapping,
  getColor,
  getLabel,
  ...chipProps
}) => {
  const theme = useTheme();

  // Default mappings for common statuses
  const defaultColorMapping: Record<string, StatusType> = {
    // Task/submission statuses
    completed: 'success',
    graded: 'success',
    in_progress: 'warning',
    not_started: 'default',
    pending: 'info',

    // Course statuses
    draft: 'default',
    published: 'success',
    archived: 'secondary',

    // Progress-based (use with percentage values)
    high: 'success',
    medium: 'warning',
    low: 'error',

    // Other common statuses
    active: 'success',
    inactive: 'default',
    approved: 'success',
    rejected: 'error',
    waiting: 'warning',
    failed: 'error',
  };

  // Default label formatting (convert snake_case to Title Case)
  const defaultGetLabel = (status: string): string => {
    if (labelMapping && labelMapping[status]) {
      return labelMapping[status];
    }

    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  // Determine the color based on status
  const determineColor = (): StatusType => {
    if (getColor) {
      return getColor(status);
    }

    const mapping = colorMapping || defaultColorMapping;
    return mapping[status.toLowerCase()] || 'default';
  };

  // Determine the label
  const determineLabel = (): string => {
    if (getLabel) {
      return getLabel(status);
    }

    return defaultGetLabel(status);
  };

  const color = determineColor();
  const label = determineLabel();

  return (
    <Chip
      label={label}
      color={color !== 'default' ? color : undefined}
      sx={{
        ...(color === 'default' && {
          backgroundColor: theme.palette.grey[300],
          color: theme.palette.text.primary,
        }),
        ...chipProps.sx,
      }}
      size="small"
      {...chipProps}
    />
  );
};

export default StatusChip;
