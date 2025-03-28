import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { getPasswordStrengthColor, getPasswordStrengthLabel } from '../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  score: number;
  feedback: string[];
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  score,
  feedback,
}) => {
  const strengthColor = getPasswordStrengthColor(score);
  const strengthLabel = getPasswordStrengthLabel(score);

  return (
    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="textSecondary">
          Password Strength:
        </Typography>
        <Typography variant="body2" sx={{ color: strengthColor }}>
          {strengthLabel}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(score / 4) * 100}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: strengthColor,
            borderRadius: 4,
          },
        }}
      />
      {feedback.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {feedback.map((message, index) => (
            <Typography
              key={index}
              variant="caption"
              color="error"
              display="block"
              sx={{ mt: 0.5 }}
            >
              • {message}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator;
