import React from 'react';
import {List, ListItem, ListItemText} from '@mui/material';

interface ICourse {
  id: string;
  title: string;
  description: string;
}

interface ICourseListProps {
  courses: ICourse[];
}

const CourseList: React.FC<ICourseListProps> = ({courses}) => {
  return (
    <List>
      {courses.map((course) => (
        <ListItem key={course.id}>
          <ListItemText primary={course.title} secondary={course.description} />
        </ListItem>
      ))}
    </List>
  );
};

export default CourseList;
