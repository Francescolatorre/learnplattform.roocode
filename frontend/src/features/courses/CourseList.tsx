import React from 'react';
import { Link } from 'react-router-dom';

const CourseList: React.FC<{ courses: { id: string; title: string }[] }> = ({ courses }) => {
    return (
        <div>
            {courses.map((course) => (
                <div key={course.id}>
                    <h3>{course.title}</h3>
                    <Link to={`/courses/${course.id}/details`}>
                        <button>View Details</button>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
