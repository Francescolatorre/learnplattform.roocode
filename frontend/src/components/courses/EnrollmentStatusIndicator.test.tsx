import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EnrollmentStatusIndicator from './EnrollmentStatusIndicator';
import { describe, it, expect } from 'vitest';

// Create test themes
const lightTheme = createTheme({ palette: { mode: 'light' } });
const darkTheme = createTheme({ palette: { mode: 'dark' } });

// Helper component to provide theme
const TestWrapper: React.FC<{ theme: any; children: React.ReactNode }> = ({ theme, children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('EnrollmentStatusIndicator', () => {
  it('should display enrolled status when user is enrolled', () => {
    render(
      <TestWrapper theme={lightTheme}>
        <EnrollmentStatusIndicator isEnrolled={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Enrolled')).toBeInTheDocument();
  });

  it('should display completed status when course is completed', () => {
    render(
      <TestWrapper theme={lightTheme}>
        <EnrollmentStatusIndicator isEnrolled={true} isCompleted={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should display not enrolled status when user is not enrolled', () => {
    render(
      <TestWrapper theme={lightTheme}>
        <EnrollmentStatusIndicator isEnrolled={false} />
      </TestWrapper>
    );

    expect(screen.getByText('Not Enrolled')).toBeInTheDocument();
  });

  it('should not display anything when not enrolled and showNotEnrolled is false', () => {
    const { container } = render(
      <TestWrapper theme={lightTheme}>
        <EnrollmentStatusIndicator isEnrolled={false} showNotEnrolled={false} />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render compact version when compact prop is true', () => {
    const { container } = render(
      <TestWrapper theme={lightTheme}>
        <EnrollmentStatusIndicator isEnrolled={true} compact={true} />
      </TestWrapper>
    );

    // Compact version uses Chip component which renders differently
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('should render with dark theme correctly', () => {
    const { container } = render(
      <TestWrapper theme={darkTheme}>
        <EnrollmentStatusIndicator isEnrolled={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Enrolled')).toBeInTheDocument();
    // Ensure the component renders in dark mode without errors
    expect(container.firstChild).not.toBeNull();
  });
});
