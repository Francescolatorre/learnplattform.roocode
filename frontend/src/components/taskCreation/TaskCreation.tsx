import React, {useState, useEffect} from 'react';
import {Box, Button, TextField, FormControlLabel, Switch, Dialog, DialogContent, DialogTitle, DialogActions} from '@mui/material';
import MarkdownEditor from '../shared/MarkdownEditor';
import {createTask, updateTask} from '@/services/resources/learningTaskService';
import {ILearningTask} from '@/types/task';
import {useNotification} from '@components/ErrorNotifier/useErrorNotifier';

interface TaskCreationProps {
    open: boolean;
    onClose: () => void;
    courseId?: string;
    task?: Partial<ILearningTask>;
    isEditing?: boolean;
    onSave?: (task: Partial<ILearningTask>) => void;
}

const TaskCreation: React.FC<TaskCreationProps> = ({
    open,
    onClose,
    courseId,
    task = {},
    isEditing = false,
    onSave
}) => {
    const [formData, setFormData] = useState<Partial<ILearningTask>>({
        title: '',
        description: '',
        is_published: false,
        ...task
    });
    const [error, setError] = useState('');
    const notify = useNotification();

    // Update form data when the task prop changes (for editing)
    useEffect(() => {
        if (task) {
            setFormData({
                title: '',
                description: '',
                is_published: false,
                ...task
            });
        }
    }, [task]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            description: value,
        }));
    };

    const handleSubmit = async () => {
        // Validate form
        if (!formData.title || !formData.description) {
            setError('Title and description are required.');
            return;
        }

        try {
            // If onSave is provided, use it (this handles both create and update)
            if (onSave) {
                onSave(formData);
            } else {
                // Otherwise use the direct API approach
                if (!courseId) {
                    throw new Error('Course ID is required for task creation.');
                }

                const taskData = {
                    ...formData,
                    course: Number(courseId)
                };

                if (isEditing && formData.id) {
                    await updateTask(String(formData.id), taskData);
                    notify('Task updated successfully', 'success');
                } else {
                    await createTask(taskData);
                    notify('Task created successfully', 'success');
                }

                // Reset form and close dialog
                resetForm();
            }
        } catch (err) {
            console.error('Error saving task:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save task. Please try again.';
            setError(errorMessage);
            notify(errorMessage, 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            is_published: false
        });
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEditing ? 'Edit Task' : 'Create a New Task'}</DialogTitle>
            <DialogContent>
                <Box sx={{padding: 2}}>
                    <TextField
                        label="Task Title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        fullWidth
                        error={!!error && !formData.title}
                        helperText={error && !formData.title ? error : ''}
                        sx={{marginBottom: 2}}
                    />
                    <MarkdownEditor
                        value={formData.description || ''}
                        onChange={handleDescriptionChange}
                        label="Task Description"
                        minRows={8}
                        error={!!error && !formData.description}
                        helperText={error && !formData.description ? error : ''}
                    />

                    <Box sx={{mt: 2}}>
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
                        <Box sx={{mt: 2, color: 'error.main'}}>{error}</Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={resetForm}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {isEditing ? 'Save Changes' : 'Create Task'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskCreation;
