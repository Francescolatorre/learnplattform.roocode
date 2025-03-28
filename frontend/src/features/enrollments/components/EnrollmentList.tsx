import React, { useEffect, useState } from 'react';
import EnrollmentService from '../services/enrollmentService';

const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await EnrollmentService.fetchUserEnrollments();
        setEnrollments(response.results);
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
        {enrollments.map(enrollment => (
          <li key={enrollment.id}>{enrollment.courseDetails.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default EnrollmentList;
