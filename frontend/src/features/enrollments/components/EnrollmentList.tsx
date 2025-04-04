import React from 'react';
import {CourseDetails, User} from '@types/common/entities';

interface Enrollment {
  id: number;
  course_details: CourseDetails;
  user_details: User;
  status: string;
}

interface EnrollmentListProps {
  enrollments: Enrollment[];
}

const EnrollmentList: React.FC<EnrollmentListProps> = ({enrollments}) => {
  return (
    <div>
      {enrollments.map(enrollment => (
        <div key={enrollment.id}>
          <h3>{enrollment.course_details.title}</h3>
          <p>Enrolled by: {enrollment.user_details.display_name}</p>
          <p>Status: {enrollment.status}</p>
        </div>
      ))}
    </div>
  );
};

export default EnrollmentList;
