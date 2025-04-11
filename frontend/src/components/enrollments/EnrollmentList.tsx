
import EnrollmentService from '@services/resources/enrollmentService';
import {Enrollment} from 'src/types/common/entities';
import React, {useEffect, useState} from 'react';

const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await EnrollmentService.getAll();
        setEnrollments(response as Enrollment[]);
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
        {enrollments.map((enrollment: Enrollment) => (
          <li key={enrollment.id}>{enrollment.course_details.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default EnrollmentList;
