import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../hooks/useCourse';
import TaskManagementUI from '../components/TaskManagementUI';
import { fetchTasksByCourse } from '../services/taskService';
import { useAuth } from '../features/auth/AuthContext'; // Import useAuth hook

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId) return <div>Course ID not provided</div>;

  const { course, loading, error } = useCourse(courseId);
  const [taskDescription, setTaskDescription] = useState("");
  const [tasks, setTasks] = useState<any[]>([]); // Correct type for tasks
  const { user } = useAuth(); // Use context to get user information

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchTasksByCourse(courseId);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    loadTasks();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!course) return <div>Course not found</div>;

  const userRole = user?.role || 'student'; // Use context to get user role
  console.log("User role in CourseDetailsPage:", userRole);

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Instructor: {course.instructor}</p>
      <p>Status: {course.status}</p>
      <p>Learning Objectives: {course.learningObjectives}</p>
      <p>Prerequisites: {course.prerequisites}</p>
      <TaskManagementUI
        courseId={courseId}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
        tasks={tasks}
        setTasks={setTasks} // Pass setTasks to TaskManagementUI
        userRole={userRole} // Pass user role to TaskManagementUI
      />
    </div>
  );
};

export default CourseDetailsPage;
