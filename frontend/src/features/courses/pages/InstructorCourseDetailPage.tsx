import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress, Typography, Box } from '@mui/material';

import { useCourse } from '../../../hooks/useCourse';
import TaskManagementUI from '../../../components/TaskManagementUI';
import { fetchTasksByCourse } from '../../../services/resources/taskService';
import { fetchStudentProgressByCourse } from '../../../services/resources/progressService';
import { useAuth } from '../../auth/context/AuthContext';
import { CourseProgress } from '../../../types/common/progressTypes';

// Styles for the course details page
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '15px',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
  },
  description: {
    fontSize: '18px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  infoSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #eee',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '8px',
  },
  infoContent: {
    fontSize: '16px',
    color: '#333',
  },
  tasksSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  tasksTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
    borderBottom: '2px solid #28a745',
    paddingBottom: '10px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '20px',
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
  },
  progressSection: {
    marginBottom: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
};

const InstructorCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId) return <div style={styles.errorContainer}>Course ID not provided</div>;

  const { course, loading, error } = useCourse(courseId);
  const [taskDescription, setTaskDescription] = useState('');
  const [tasks, setTasks] = useState<any[]>([]); // Correct type for tasks
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const { user } = useAuth(); // Use context to get user information
  // Get the user role from the context or local storage
  const userRole = user?.role || localStorage.getItem('user_role') || 'student';
  console.log('User role in InstructorCourseDetailPage:', userRole);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchTasksByCourse(courseId);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    loadTasks();
  }, [courseId]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!courseId) {
        console.error('Error: courseId is undefined. Cannot fetch student progress.');
        return;
      }

      try {
        const progress = await fetchStudentProgressByCourse(courseId, user?.id); // Pass user ID as studentId
        console.log('Student progress loaded:', progress);
        setCourseProgress(progress);
      } catch (error) {
        console.error('Failed to fetch course progress:', error.message);
      }
    };

    if (course) {
      loadProgress();
    }
  }, [course, courseId, user?.id]);

  if (loading) return <div style={styles.loadingContainer}>Loading course details...</div>;
  if (error) return <div style={styles.errorContainer}>Error: {error.message}</div>;
  if (!course) return <div style={styles.errorContainer}>Course not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{course.title}</h1>
        <p style={styles.description}>{course.description}</p>
      </div>

      {/* Progress Section */}
      {courseProgress && (
        <div style={styles.progressSection}>
          <Typography variant="h6" style={{ marginBottom: '10px', color: '#007bff' }}>
            Course Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={courseProgress.completionPercentage}
                color="primary"
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {`${Math.round(courseProgress.completionPercentage)}%`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">
              Completed Tasks: {courseProgress.completedTasks} / {courseProgress.totalTasks}
            </Typography>
            <Typography variant="body2">
              Average Score: {courseProgress.averageScore.toFixed(2)}
            </Typography>
          </Box>
        </div>
      )}

      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Instructor</h3>
          <p style={styles.infoContent}>
            {course.creator_details
              ? course.creator_details.display_name || course.creator_details.username
              : 'Not assigned'}
          </p>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Status</h3>
          <p style={styles.infoContent}>{course.status || 'Not specified'}</p>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Prerequisites</h3>
          <p style={styles.infoContent}>
            {Array.isArray(course.prerequisites)
              ? course.prerequisites.join(', ')
              : course.prerequisites || 'None'}
          </p>
        </div>
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>Learning Objectives</h3>
        <p style={styles.infoContent}>
          {Array.isArray(course.learning_objectives)
            ? course.learning_objectives.join(', ')
            : course.learning_objectives || 'No learning objectives specified'}
        </p>
      </div>

      <div style={styles.tasksSection}>
        <h2 style={styles.tasksTitle}>Course Tasks</h2>
        <TaskManagementUI
          courseId={courseId}
          taskDescription={taskDescription}
          setTaskDescription={setTaskDescription}
          tasks={tasks}
          setTasks={setTasks}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default InstructorCourseDetailPage;
