import {
  Box,
  LinearProgress,
  CircularProgress,
  Typography,
  BoxProps,
  useTheme,
} from '@mui/material';
import React from 'react';

export interface BaseProgressProps {
  value: number;
  label?: string | null;
  showPercentage?: boolean;
  progressHeight?: number; // Renamed from 'height' to avoid conflict
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
  variant?: 'linear' | 'circular';
  size?: number; // For circular progress
  thickness?: number; // For circular progress
}

interface ProgressIndicatorProps extends BaseProgressProps, Omit<BoxProps, 'children'> {}

/**
 * A reusable progress indicator component that can display progress as either
 * a linear bar or circular indicator with customizable colors based on thresholds.
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  label,
  showPercentage = true,
  progressHeight = 8, // Updated parameter name
  thresholds = { low: 33, medium: 66, high: 100 },
  variant = 'linear',
  size = 40,
  thickness = 4,
  ...boxProps
}) => {
  const theme = useTheme();

  // Ensure value is within 0-100 range
  const normalizedValue = Math.min(Math.max(0, value), 100);

  // Determine color based on progress value
  const getProgressColor = () => {
    if (normalizedValue < thresholds.low) {
      return theme.palette.error.main;
    } else if (normalizedValue < thresholds.medium) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.success.main;
    }
  };

  const progressColor = getProgressColor();

  return (
    <Box {...boxProps}>
      {label && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {label}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {variant === 'linear' ? (
          <Box sx={{ width: '100%', mr: showPercentage ? 1 : 0 }}>
            <LinearProgress
              variant="determinate"
              value={normalizedValue}
              sx={{
                height: progressHeight,
                borderRadius: progressHeight / 2,
                backgroundColor: theme.palette.grey[300],
                '& .MuiLinearProgress-bar': {
                  borderRadius: progressHeight / 2,
                  backgroundColor: progressColor,
                },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ position: 'relative', display: 'inline-flex', mr: showPercentage ? 1 : 0 }}>
            <CircularProgress
              variant="determinate"
              value={normalizedValue}
              size={size}
              thickness={thickness}
              sx={{ color: progressColor }}
            />
            {!showPercentage && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div" color="textSecondary">
                  {`${Math.round(normalizedValue)}%`}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {showPercentage && (
          <Box minWidth={35}>
            <Typography variant="body2" color="textSecondary">
              {`${Math.round(normalizedValue)}%`}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProgressIndicator;
