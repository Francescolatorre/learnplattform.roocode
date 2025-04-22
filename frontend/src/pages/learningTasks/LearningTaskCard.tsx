import {Card, CardContent, CardActions, Typography, Button} from '@mui/material';
import React from 'react';

interface ILearningTaskCardProps {
    title: string;
    description: string;
    dueDate: string;
    onViewTask: () => void;
}

const LearningTaskCard: React.FC<ILearningTaskCardProps> = ({
    title,
    description,
    dueDate,
    onViewTask,
}) => {
    return (
        <Card sx={{maxWidth: 345, m: 2}}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                    {description}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{mt: 2}}>
                    Due Date: {dueDate}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={onViewTask}>
                    View Task
                </Button>
            </CardActions>
        </Card>
    );
};

export default LearningTaskCard;
