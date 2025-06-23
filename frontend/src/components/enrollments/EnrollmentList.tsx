import React, {useEffect, useState} from 'react';

import {ICourseEnrollment} from '@/types/entities';
import {enrollmentService} from '@/services/resources/enrollmentService';

const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<ICourseEnrollment[]>([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await enrollmentService.getAll();
        setEnrollments(response as ICourseEnrollment[]);
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <div>
      <h1>Enrollments</h1>
      <ul>
        {enrollments.map((enrollment: ICourseEnrollment) => (
          <li key={enrollment.id}>{enrollment.course_details?.title || 'Untitled Course'}</li>
        ))}
      </ul>
    </div>
  );
};

export default EnrollmentList;
