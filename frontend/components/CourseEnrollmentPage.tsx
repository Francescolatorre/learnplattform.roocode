import React, { useEffect, useMemo } from 'react';
import { useApiResource } from '@hooks/useApiResource';

const CourseEnrollmentPage = React.memo(() => {
    const { data: enrollmentsResponse } = useApiResource('/api/v1/course-enrollments', {});

    const processedEnrollments = useMemo(() => {
        if (!enrollmentsResponse) return [];
        return enrollmentsResponse.results.map((enrollment) => ({
            ...enrollment,
            enrolled: enrollment.status === 'enrolled',
        }));
    }, [enrollmentsResponse]);

    useEffect(() => {
        console.log('Enrollments Response:', enrollmentsResponse);
        console.log('Processed Enrollments:', processedEnrollments);
    }, [enrollmentsResponse, processedEnrollments]);

    return (
        <div>
            {processedEnrollments.map((course) => (
                <div key={course.id}>
                    Rendering course: {course.name}, Enrolled: {course.enrolled.toString()}
                </div>
            ))}
        </div>
    );
});

export default CourseEnrollmentPage;
