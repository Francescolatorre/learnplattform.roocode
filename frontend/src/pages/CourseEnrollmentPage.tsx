import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Spin, Alert, List, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { EnrollableCourse } from '@types/Course';
import { enrollInCourse, fetchStudentProgress, fetchCourses } from '@services/courseService';
import { useEnrollments } from '@hooks/useEnrollments';

const { Title } = Typography;

const CourseEnrollmentPage: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState<EnrollableCourse | null>(null);
    const [courses, setCourses] = useState<EnrollableCourse[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [coursesError, setCoursesError] = useState<Error | null>(null);
    const { enroll, isLoading: isEnrolling, error: enrollError } = useEnrollments();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const fetchStudentProgressForCourse = async (courseId: number) => {
        try {
            console.log(`Attempting to fetch student progress for course ${courseId}`);
            const progress = await fetchStudentProgress(courseId);
            console.log('Student Progress Response:', progress);
        } catch (error) {
            console.error('Error fetching student progress:', error);
        }
    };

    useEffect(() => {
        console.log('CourseEnrollmentPage: Component Mounted');
        console.log('Courses:', courses);
        console.log('Loading Courses:', isLoadingCourses);
        console.log('Courses Error:', coursesError);

        // Attempt to fetch student progress for the first course
        if (courses.length > 0) {
            fetchStudentProgressForCourse(courses[0].id);
        }

        return () => console.log('CourseEnrollmentPage: Component Unmounted');
    }, [courses, isLoadingCourses, coursesError]);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                setIsLoadingCourses(true);
                const fetchedCourses = await fetchCourses();
                if (!fetchedCourses.results || fetchedCourses.results.length === 0) {
                    throw new Error('No courses available');
                }
                setCourses(
                    fetchedCourses.results.map(course => ({
                        ...course,
                        instructor: 'Unknown', // Replace with actual data if available
                        difficulty: 'beginner', // Replace with actual data if available
                        enrollmentStatus: course.status === 'published' ? 'open' : 'closed',
                        progress: undefined // Optional progress
                    }))
                );
                setCoursesError(null);
            } catch (error) {
                console.error('Error loading courses:', error);
                setCoursesError(error as Error);
            } finally {
                setIsLoadingCourses(false);
            }
        };

        loadCourses();
    }, []);

    const handleEnroll = async (course: EnrollableCourse) => {
        try {
            await enrollInCourse(course.id);

            // Attempt to fetch student progress after enrollment
            if (course.id) {
                fetchStudentProgressForCourse(course.id);
            }

            setSelectedCourse(null);
        } catch (error) {
            console.error('Enrollment failed', error);
        }
    };

    const handleCancel = () => {
        setSelectedCourse(null);
    };

    const handleConfirmEnroll = () => {
        if (selectedCourse) {
            handleEnroll(selectedCourse);
        }
    };

    const showEnrollModal = (course: EnrollableCourse) => {
        setSelectedCourse(course);
    };

    return (
        <div>
            <Title>Course Enrollment</Title>
            {coursesError && <Alert message="Error" description={coursesError.message} type="error" showIcon />}
            {enrollError && <Alert message="Error" description={enrollError.message} type="error" showIcon />}
            {isLoadingCourses ? (
                <Spin tip="Loading courses..." />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={courses}
                    renderItem={(course) => (
                        <List.Item
                            actions={[
                                <Button type="primary" onClick={() => showEnrollModal(course)}>
                                    Enroll
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta title={course.title} description={course.description} />
                        </List.Item>
                    )}
                />
            )}
            <Modal
                title="Confirm Enrollment"
                visible={!!selectedCourse}
                onOk={handleConfirmEnroll}
                onCancel={handleCancel}
                confirmLoading={isEnrolling}
                okText="Enroll"
                cancelText="Cancel"
                icon={<ExclamationCircleOutlined />}
            >
                {selectedCourse && (
                    <div>
                        <p>Are you sure you want to enroll in the course: {selectedCourse.title}?</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CourseEnrollmentPage;
