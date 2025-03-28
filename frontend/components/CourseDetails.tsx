import React, { useMemo } from 'react';
import { useApiResource } from '@hooks/useApiResource';

const CourseDetails = ({ courseId }: { courseId: number }) => {
    const params = useMemo(() => ({ includeArchived: true }), []); // Memoize params to avoid re-fetching
    const { data: courseData } = useApiResource(`/api/v1/courses/${courseId}`, params);

    return (
        <div>
            {/* Render course details */}
        </div>
    );
};
export default CourseDetails;
