// ListView.tsx
import React from 'react';
import { List, ListItem } from '@mui/material';
import { ICourse } from '@/types';
import CourseCard from '@/components/courses/CourseCard';

interface ListViewProps {
  courses: ICourse[];
  isInstructorView?: boolean;
}

const ListView: React.FC<ListViewProps> = ({ courses, isInstructorView }) => {
  return (
    <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        '& > li': {
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateX(8px)',
          },
        },
      }}
    >
      {courses.map(course => (
        <ListItem
          key={course.id}
          sx={{
            display: 'block',
            mb: 1,
            p: 1,
          }}
        >
          <CourseCard course={course} isInstructorView={isInstructorView} viewMode="list" />
        </ListItem>
      ))}
    </List>
  );
};

export default ListView;
