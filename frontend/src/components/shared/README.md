# Shared Components

This directory contains reusable, general-purpose components that are used across multiple features of the Learning Platform application.

## Available Components

### UI Components

- **DataTable** - Reusable data table with sorting, filtering, and pagination capabilities
- **StatusChip** - Displays status indicators with appropriate colors based on status values
- **ErrorMessage** - Standardized error message display using Material UI's Alert component
- **LoadingIndicator** - Centralized loading spinner for consistent loading states
- **ProgressIndicator** - Visual progress indicator supporting both linear and circular variants
- **ProgressOverview** - Summary view of learning progress metrics in a standardized grid
- **PasswordStrengthIndicator** - Visual indicator for password strength during registration/password change

### Application Components

- **ErrorBoundary** - Catches and displays JavaScript errors during rendering
- **TokenRefreshHandler** - Manages JWT token refresh logic to maintain authenticated sessions

## Usage

All components are exported from the index.ts file for easy importing:

```typescript
import {
  DataTable,
  StatusChip,
  ErrorMessage,
  LoadingIndicator,
  ProgressIndicator,
  PasswordStrengthIndicator,
  ErrorBoundary,
  TokenRefreshHandler,
  ProgressOverview,
} from '../components/shared';
```

## Component Documentation

### DataTable

A flexible data table component that supports:

- Custom column configurations
- Sorting and filtering
- Pagination
- Empty state handling
- Loading and error states

### StatusChip

A component for displaying status values as colored chips with appropriate visual indicators.

- Supports custom color and label mappings
- Pre-configured for common statuses (completed, active, pending, etc.)

### ErrorMessage

Standardized error message component with consistent styling.

- Supports different severity levels (error, warning, info)
- Can display a title and detailed message

### LoadingIndicator

A centered loading spinner for consistent loading state display.

### ProgressIndicator

Visual indicator for progress values, supporting:

- Linear or circular display
- Custom thresholds for color changes
- Percentage display options

### ProgressOverview

Grid layout for displaying progress metrics in a standardized format.

### PasswordStrengthIndicator

Visual indicator for password strength with:

- Color-coded strength indicator
- Strength label (Weak, Medium, Strong)
- Validation feedback messages

### ErrorBoundary

React error boundary for catching and displaying runtime errors.

- Prevents full application crashes
- Provides user-friendly error messages
- Includes retry functionality

### TokenRefreshHandler

Invisible component that manages JWT token refreshing:

- Automatically refreshes tokens before expiry
- Handles refresh failures
- Publishes auth events for components to react to
