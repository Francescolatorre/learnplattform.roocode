import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Button } from '@mui/material';
import { useCourseTasks } from '@hooks/useCourseTasks';
import { DataTable, Column } from '@components/common/DataTable';
import { useAuth } from '@features/auth/AuthContext';

const StudentTasksPage: React.FC = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const { data: tasks, isLoading, error } = useCourseTasks(courseId!);

    React.useEffect(() => {
        console.log('StudentTasksPage rendered for user:', user);
    }, [user]);

    const columns: Column<any>[] = [
        { id: 'title', label: 'Task Title' },
        { id: 'description', label: 'Description' },
        { id: 'status', label: 'Status' },
        {
            id: 'actions',
            label: 'Actions',
            format: (_, task) => (
                <Button
                    variant="text"
                    color="primary"
                    onClick={() => alert(`Edit Task: ${task.id}`)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    if (!courseId) {
        return (
            <Container maxWidth="lg">
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h5" gutterBottom>Course Not Found</Typography>
                    <Typography variant="body1">The course you are looking for could not be found.</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>Tasks for Course {courseId}</Typography>
            {isLoading ? (
                <Typography>Loading tasks...</Typography>
            ) : error ? (
                <Typography>Error loading tasks: {error.message}</Typography>
            ) : (
                <DataTable
                    columns={columns}
                    data={tasks || []}
                    loading={isLoading}
                    error={error?.message || null}
                    keyExtractor={(task) => task.id}
                    emptyMessage="No tasks available for this course."
                />
            )}
        </Container>
    );
};

export default StudentTasksPage;
