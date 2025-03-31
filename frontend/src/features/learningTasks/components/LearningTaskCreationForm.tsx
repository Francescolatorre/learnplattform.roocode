import React, { useState } from 'react';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Snackbar,
} from '@mui/material';

import { useCourses } from '../../../hooks/useCourses';
import { createTask, TaskCreationData } from '../../../services/resources/taskService';

interface TaskCreationFormValues {
  title: string;
  description: string;
  courseId: string;
  is_published: boolean;
  max_submissions: number;
  deadline: Date | null;
}

const TaskCreationForm: React.FC = () => {
  const { courses, loading: coursesLoading, error: courseError } = useCourses();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Task title is required')
      .min(3, 'Title must be at least 3 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters'),
    courseId: Yup.number().required('Please select a course'),
    max_submissions: Yup.number()
      .positive('Max submissions must be positive')
      .integer('Max submissions must be a whole number')
      .min(1, 'At least one submission is required'),
  });

  const handleSubmit = async (
    values: TaskCreationFormValues,
    { setSubmitting, resetForm }: FormikHelpers<TaskCreationFormValues>
  ) => {
    try {
      setSubmitError(null);
      const taskData: TaskCreationData = {
        ...values,
        course: Number(values.courseId),
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        attachment: attachment || undefined, // Change null to undefined
      };

      await createTask(taskData);

      // Success handling
      setSubmitSuccess(true);
      resetForm();
      setAttachment(null);
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create task. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik<TaskCreationFormValues>({
    initialValues: {
      title: '',
      description: '',
      courseId: '',
      is_published: false,
      max_submissions: 1,
      deadline: null,
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachment(event.target.files[0]);
    }
  };

  const handleCloseSuccess = () => {
    setSubmitSuccess(false);
  };

  const handleCloseError = () => {
    setSubmitError(null);
  };

  if (coursesLoading) {
    return <CircularProgress />;
  }

  if (courseError) {
    return <Alert severity="error">{courseError.message}</Alert>;
  }

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="title"
          name="title"
          label="Task Title"
          value={formik.values.title}
          onChange={formik.handleChange}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          margin="normal"
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          id="description"
          name="description"
          label="Task Description"
          value={formik.values.description}
          onChange={formik.handleChange}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Course</InputLabel>
          <Select
            id="courseId"
            name="courseId"
            value={formik.values.courseId}
            label="Course"
            onChange={formik.handleChange}
            error={formik.touched.courseId && Boolean(formik.errors.courseId)}
          >
            {courses.map(course => (
              <MenuItem key={course.id} value={course.id}>
                {course.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          type="number"
          id="max_submissions"
          name="max_submissions"
          label="Maximum Submissions"
          value={formik.values.max_submissions}
          onChange={formik.handleChange}
          error={formik.touched.max_submissions && Boolean(formik.errors.max_submissions)}
          helperText={formik.touched.max_submissions && formik.errors.max_submissions}
          margin="normal"
        />

        <FormControlLabel
          control={
            <Switch
              checked={formik.values.is_published}
              onChange={e => formik.setFieldValue('is_published', e.target.checked)}
              name="is_published"
            />
          }
          label="Publish Task"
        />

        <input
          accept="*/*"
          style={{ display: 'none' }}
          id="contained-button-file"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="contained-button-file">
          <Button variant="contained" component="span">
            Upload Attachment
          </Button>
        </label>
        {attachment && <p>File: {attachment.name}</p>}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </form>

      <Snackbar open={submitSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success">
          Task created successfully!
        </Alert>
      </Snackbar>

      <Snackbar open={!!submitError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error">
          {submitError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskCreationForm;
