import React, { useMemo } from 'react';
import { useApiResource } from '@hooks/useApiResource';

const CourseDetailsPage = React.memo(({ courseId }: { courseId: number }) => {
    const params = useMemo(() => ({ includeEnrollmentStatus: true }), []); // Memoize params
    const { data: courseData } = useApiResource(`/api/v1/courses/${courseId}`, params);

    return (
        <div>
            {/* Render course details */}
        </div>
    );
});

export default CourseDetailsPage;
