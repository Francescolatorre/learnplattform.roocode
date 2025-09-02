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
  CircularProgress,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import useNotification from '@/components/Notifications/useNotification';
import { courseService } from '@/services/resources/courseService';
import { ICourse } from '@/types/course';

import MarkdownEditor from '../shared/MarkdownEditor';

interface CourseCreationProps {
  open: boolean;
  onClose: () => void;
  course?: Partial<ICourse>;
  isEditing?: boolean;
  onSave?: (course: Partial<ICourse>) => void;
  notificationService?: (
    message: string,
    severity?: 'error' | 'success' | 'info' | 'warning'
  ) => void;
}

const CourseCreation: React.FC<CourseCreationProps> = ({
  open,
  onClose,
  course = {},
  isEditing = false,
  onSave,
  notificationService,
}) => {
  const [formData, setFormData] = useState<Partial<ICourse>>({
    title: '',
    description: '',
    is_published: false,
    status: 'draft',
    visibility: 'public',
    category: '',
    difficulty_level: 'beginner',
    ...course,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        is_published: false,
        status: 'draft',
        visibility: 'public',
        category: '',
        difficulty_level: 'beginner',
        ...course,
      });
      setError('');
    }
  }, [open, course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleEditorChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      is_published: false,
      status: 'draft',
      visibility: 'public',
      category: '',
      difficulty_level: 'beginner',
    });
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const courseData: Partial<ICourse> = {
        title: formData.title,
        description: formData.description,
        status: formData.is_published ? 'published' : 'draft',
        visibility: formData.visibility || 'public',
        category: formData.category,
        difficulty_level: formData.difficulty_level,
      };

      if (onSave) {
        await onSave(courseData);
      }
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course');
      if (notificationService) {
        notificationService(err instanceof Error ? err.message : 'Failed to save course', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth data-testid="course-modal">
      <DialogTitle sx={{ mb: 2 }}>{isEditing ? 'Edit Course' : 'Create New Course'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            required
            label="Title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            error={error.includes('Title')}
            helperText={error.includes('Title') ? error : ''}
            margin="normal"
            inputProps={
              {
                'data-testid': 'course-title-input',
              } as any
            }
          />

          <Box sx={{ mt: 3 }}>
            <MarkdownEditor
              id="course-description"
              label="Description"
              value={formData.description || ''}
              onChange={value => handleEditorChange('description', value)}
              error={error.includes('description')}
              helperText={error.includes('description') ? error : ''}
              data-testid="course-description-editor"
            />
          </Box>

          <TextField
            fullWidth
            select
            label="Category"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            margin="normal"
            SelectProps={{
              native: true,
            }}
            inputProps={{
              'data-testid': 'course-category-input',
            }}
          >
            <option value="">Select Category</option>
            <option value="Programming">Programming</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="DevOps">DevOps</option>
            <option value="Testing">Testing</option>
          </TextField>

          <TextField
            fullWidth
            select
            label="Difficulty Level"
            name="difficulty_level"
            value={formData.difficulty_level || 'beginner'}
            onChange={handleChange}
            margin="normal"
            SelectProps={{
              native: true,
            }}
            inputProps={{
              'data-testid': 'course-difficulty-select',
            }}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_published || false}
                onChange={handleChange}
                name="is_published"
                inputProps={
                  {
                    'data-testid': 'course-publish-switch',
                  } as any
                }
              />
            }
            label="Publish Course"
            sx={{ mt: 2 }}
          />

          {error && !error.includes('Title') && !error.includes('description') && (
            <Box sx={{ mt: 2, color: 'error.main' }}>{error}</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          disabled={isSubmitting}
          data-testid="course-modal-cancel-button"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          data-testid="course-modal-save-button"
        >
          {isEditing ? 'Save Changes' : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseCreation;
