import React, { useEffect, useState } from 'react';

import { modernEnrollmentService } from '@/services/resources/modernEnrollmentService';
import { ICourseEnrollment } from '@/types/entities';

const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<ICourseEnrollment[]>([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await modernEnrollmentService.getAllEnrollments();
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
