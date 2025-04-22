import React, {useEffect, useState} from 'react';

import {IEnrollment} from '@/types/entities';
import EnrollmentService from '@services/resources/enrollmentService';

const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await EnrollmentService.getAll();
        setEnrollments(response as IEnrollment[]);
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
        {enrollments.map((enrollment: IEnrollment) => (
          <li key={enrollment.id}>{enrollment.course_details?.title || 'Untitled Course'}</li>
        ))}
      </ul>
    </div>
  );
};

export default EnrollmentList;
