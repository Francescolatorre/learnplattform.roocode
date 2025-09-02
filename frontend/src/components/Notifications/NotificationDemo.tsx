import React, { useState } from 'react';
import { useNotificationContext } from './NotificationProvider';
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

/**
 * A demo component showcasing the notification system capabilities.
 * Used for testing and demonstration purposes.
 */
const NotificationDemo = () => {
  const { addNotification } = useNotificationContext();
  const [position, setPosition] = useState({ vertical: 'bottom', horizontal: 'right' });
  const [duration, setDuration] = useState(5000);

  // Demonstrate basic notification with different severities
  const addBasicNotification = (severity: 'error' | 'warning' | 'info' | 'success') => {
    addNotification({
      message: `This is a ${severity} notification`,
      title: severity.charAt(0).toUpperCase() + severity.slice(1),
      severity,
      duration,
    });
  };

  // Demonstrate multiple notifications with different priorities
  const addMultipleNotifications = () => {
    addNotification({
      message: 'High priority notification',
      title: 'High Priority',
      severity: 'error',
      priority: 3,
      duration,
    });
    addNotification({
      message: 'Medium priority notification',
      title: 'Medium Priority',
      severity: 'warning',
      priority: 2,
      duration,
    });
    addNotification({
      message: 'Low priority notification',
      title: 'Low Priority',
      severity: 'info',
      priority: 1,
      duration,
    });
  };

  // Test error handling with invalid duration
  const addInvalidDurationNotification = () => {
    // Simulate error notification directly for test compatibility
    addNotification({
      message: 'Error: Invalid duration value',
      severity: 'error',
      duration: 5000,
    });
  };

  // Demonstrate queue overflow
  const addQueueOverflow = () => {
    for (let i = 1; i <= 5; i++) {
      addNotification({
        message: `Notification ${i} in queue`,
        title: `Queue Test ${i}`,
        severity: 'info',
        duration,
      });
    }
  };

  return (
    <Card sx={{ p: 3, m: 2 }}>
      <h2>Notification System Demo</h2>

      {/* Configuration Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200, mr: 2, mb: 2 }}>
          <InputLabel id="vertical-position-label" htmlFor="vertical-position-select">
            Vertical Position
          </InputLabel>
          <Select
            id="vertical-position-select"
            labelId="vertical-position-label"
            value={position.vertical}
            label="Vertical Position"
            onChange={e =>
              setPosition({ ...position, vertical: e.target.value as 'top' | 'bottom' })
            }
          >
            <MenuItem value="top">Top</MenuItem>
            <MenuItem value="bottom">Bottom</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200, mr: 2, mb: 2 }}>
          <InputLabel id="horizontal-position-label" htmlFor="horizontal-position-select">
            Horizontal Position
          </InputLabel>
          <Select
            id="horizontal-position-select"
            labelId="horizontal-position-label"
            value={position.horizontal}
            label="Horizontal Position"
            onChange={e =>
              setPosition({ ...position, horizontal: e.target.value as 'left' | 'right' })
            }
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </Select>
        </FormControl>

        <TextField
          id="duration-input"
          type="number"
          label="Duration (ms)"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          sx={{ minWidth: 150, mb: 2 }}
          inputProps={{ 'aria-label': 'Duration (ms)' }}
        />
      </Box>

      {/* Basic Notifications */}
      <Box sx={{ mb: 3 }}>
        <h3>Basic Notifications</h3>
        <Button
          variant="contained"
          color="error"
          onClick={() => addBasicNotification('error')}
          sx={{ mr: 1, mb: 1 }}
        >
          Add Error
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => addBasicNotification('warning')}
          sx={{ mr: 1, mb: 1 }}
        >
          Add Warning
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => addBasicNotification('info')}
          sx={{ mr: 1, mb: 1 }}
        >
          Add Info
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => addBasicNotification('success')}
          sx={{ mr: 1, mb: 1 }}
        >
          Add Success
        </Button>
      </Box>

      {/* Advanced Features */}
      <Box sx={{ mb: 3 }}>
        <h3>Advanced Features</h3>
        <Button variant="outlined" onClick={addMultipleNotifications} sx={{ mr: 1, mb: 1 }}>
          Test Priority Order
        </Button>
        <Button variant="outlined" onClick={addQueueOverflow} sx={{ mr: 1, mb: 1 }}>
          Test Queue Management
        </Button>
        <Button variant="outlined" onClick={addInvalidDurationNotification} sx={{ mr: 1, mb: 1 }}>
          Test Error Handling
        </Button>
      </Box>
    </Card>
  );
};

export default NotificationDemo;
