import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '18px',
      color: '#555',
      lineHeight: '1.6',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #eee',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1rem',
          color: '#333',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: '32px',
          color: '#333',
          marginBottom: '15px',
          borderBottom: '2px solid #007bff',
          paddingBottom: '10px',
        },
        h2: {
          fontSize: '24px',
          color: '#333',
          marginBottom: '20px',
          borderBottom: '2px solid #28a745',
          paddingBottom: '10px',
        },
        body1: {
          fontSize: '18px',
          color: '#555',
          lineHeight: '1.6',
        },
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          display: 'grid',
          gap: '20px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: '8px',
          borderRadius: '4px',
        },
        bar: {
          borderRadius: '4px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});
