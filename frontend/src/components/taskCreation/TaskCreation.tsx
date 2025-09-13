import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react';

import useNotification from '@/components/Notifications/useNotification';
import { createTask, updateTask } from '@/services/resources/learningTaskService';
import { ILearningTask } from '@/types/Task';

import MarkdownEditor from '../shared/MarkdownEditor';

interface TaskCreationProps {
  open: boolean;
  onClose: () => void;
  courseId?: string;
  task?: Partial<ILearningTask>;
  isEditing?: boolean;
  onSave?: (task: Partial<ILearningTask>) => void;
  notificationService?: (
    message: string,
    severity?: 'error' | 'success' | 'info' | 'warning'
  ) => void;
}

const TaskCreation: React.FC<TaskCreationProps> = ({
  open,
  onClose,
  courseId,
  task = {},
  isEditing = false,
  onSave,
  notificationService,
}) => {
  const [formData, setFormData] = useState<Partial<ILearningTask>>({
    title: '',
    description: '',
    is_published: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previouslyOpen, setPreviouslyOpen] = useState(open);
  const prevTaskRef = useRef(task);
  const defaultNotify = useNotification();
  const notify = notificationService || defaultNotify;
  const queryClient = useQueryClient();

  // Update form data when the dialog opens or task changes
  useEffect(() => {
    // Only reset form when dialog is first opened (not on every re-render)
    if (open && !previouslyOpen) {
      // Initialize form data when modal opens
      setFormData({
        title: '',
        description: '',
        is_published: false,
        ...task,
      });
      prevTaskRef.current = task;
    }

    // Handle task prop changes (for editing mode)
    if (open && previouslyOpen && JSON.stringify(task) !== JSON.stringify(prevTaskRef.current)) {
      // Only update if task actually changed (not just re-rendered)
      if (Object.keys(task).length > 0) {
        setFormData({
          title: '',
          description: '',
          is_published: false,
          ...task,
        });
      }
      prevTaskRef.current = task;
    }

    // Track open state changes
    if (previouslyOpen !== open) {
      setPreviouslyOpen(open);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, previouslyOpen]); // Removed 'task' from dependencies to prevent reset on every render

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: value,
    }));
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate form
    if (!formData.title || !formData.description) {
      setError('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // If onSave is provided, use it (this handles both create and update)
      if (onSave) {
        await onSave(formData);
        if (courseId) {
          queryClient.invalidateQueries({ queryKey: ['courseTasks', courseId] });
          queryClient.invalidateQueries({ queryKey: ['learningTasks', courseId] });
        }
        resetForm();
      } else {
        // Otherwise use the direct API approach
        if (!courseId) {
          throw new Error('Course ID is required for task creation.');
        }

        const taskData = {
          ...formData,
          title: formData.title || '',
          description: formData.description || '',
          course: Number(courseId),
        };

        if (isEditing && formData.id) {
          await updateTask(String(formData.id), taskData);
          notify('Task updated successfully', 'success');
        } else {
          await createTask(taskData);
          notify('Task created successfully', 'success');
        }

        // Ensure other components get fresh data
        if (courseId) {
          queryClient.invalidateQueries({ queryKey: ['courseTasks', courseId] });
          queryClient.invalidateQueries({ queryKey: ['learningTasks', courseId] });
        }
        // Reset form and close dialog
        resetForm();
      }
    } catch (err) {
      console.error('Error saving task:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save task. Please try again.';
      setError(errorMessage);
      notify(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      is_published: false,
    });
    setError('');
    onClose(); // Make sure this gets called only once
  };

  // Handle cancel separately from resetForm to avoid potential issues
  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Task' : 'Create a New Task'}</DialogTitle>
      <DialogContent>
        <Box sx={{ padding: 2 }}>
          <TextField
            label="Task Title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            fullWidth
            error={!!error && !formData.title}
            helperText={error && !formData.title ? error : ''}
            sx={{ marginBottom: 2 }}
          />
          <MarkdownEditor
            value={formData.description || ''}
            onChange={handleDescriptionChange}
            label="Task Description"
            minRows={8}
            error={!!error && !formData.description}
            helperText={error && !formData.description ? error : ''}
          />

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_published || false}
                  onChange={handleSwitchChange}
                  name="is_published"
                />
              }
              label="Publish Task"
            />
          </Box>

          {error && !error.includes('Title') && !error.includes('description') && (
            <Box sx={{ mt: 2, color: 'error.main' }}>{error}</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskCreation;
