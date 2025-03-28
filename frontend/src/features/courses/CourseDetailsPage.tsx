import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, Card, CardContent, Divider, CircularProgress } from '@mui/material';
import { fetchCourseDetails, fetchLearningTasks } from '../../services/courseService';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import markdownStyles from './CourseDetailsPage.styles';

interface ICourseDetails {
    id: string;
    title: string;
    description: string;
}

interface ITask {
    id: string;
    title: string;
    description: string;
    order: number;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return (
        <Box sx={markdownStyles.content}>
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </Box>
    );
};

const CourseDetailsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [courseDetails, setCourseDetails] = useState<ICourseDetails | null>(null);
    const [learningTasks, setLearningTasks] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourseDetails = async () => {
            try {
                if (!courseId) {
                    throw new Error('Course ID is missing.');
                }

                const details = await fetchCourseDetails(courseId);
                setCourseDetails(details);

                const tasks = await fetchLearningTasks(courseId);
                setLearningTasks(tasks);
            } catch (err: any) {
                console.error(`Error loading course details or learning tasks for courseId: ${courseId}`, err);
                setError(err.message || 'Failed to load course details or learning tasks.');
            } finally {
                setLoading(false);
            }
        };

        loadCourseDetails();
    }, [courseId]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                {courseDetails?.title}
            </Typography>

            {/* Render course description as Markdown */}
            {courseDetails?.description && (
                <MarkdownRenderer content={courseDetails.description} />
            )}

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                Learning Tasks
            </Typography>
            {Array.isArray(learningTasks) && learningTasks.length > 0 ? (
                <List>
                    {learningTasks
                        .sort((a, b) => a.order - b.order)
                        .map((task) => (
                            <ListItem key={task.id} disablePadding sx={{ mb: 2 }}>
                                <Card variant="outlined" sx={{ width: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6">{task.title}</Typography>
                                        <Divider sx={{ my: 1 }} />

                                        {/* Render task description as Markdown */}
                                        <MarkdownRenderer content={task.description} />
                                    </CardContent>
                                </Card>
                            </ListItem>
                        ))}
                </List>
            ) : (
                <Typography variant="body2" color="textSecondary">
                    No learning tasks available for this course.
                </Typography>
            )}
        </Box>
    );
};

export default CourseDetailsPage;
