export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4 (0: very weak, 4: very strong)
  feedback: string[];
}

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Contains uppercase
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Contains lowercase
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Contains number
  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Contains special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: feedback.length === 0,
    score: Math.min(4, score), // Cap score at 4
    feedback,
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
      return '#ff0000'; // Red - Very Weak
    case 1:
      return '#ff4d00'; // Orange - Weak
    case 2:
      return '#ffd700'; // Yellow - Fair
    case 3:
      return '#9acd32'; // Yellow Green - Good
    case 4:
      return '#008000'; // Green - Strong
    default:
      return '#808080'; // Gray - No password
  }
};

export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'No Password';
  }
};
