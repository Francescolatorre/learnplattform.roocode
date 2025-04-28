import React, {useState, useEffect, useCallback} from 'react';
import {useParams, Link} from 'react-router-dom';
import {Typography} from '@mui/material';

import {ICourse} from '@/types/course';
import {ILearningTask} from '@/types/task';
import {IStudentProgressSummary} from '@/types/gradingTypes';
import {courseService} from '@/services/resources/courseService';
import progressService from '@/services/resources/progressService';
import learningTaskService from '@/services/resources/learningTaskService';

// Simple styles for the page
const styles = {
  container: {padding: '20px'},
  header: {marginBottom: '20px'},
  title: {fontSize: '24px', fontWeight: 'bold'},
  infoSection: {display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px'},
  tasksSection: {marginTop: '20px'},
  tasksTitle: {fontSize: '20px', fontWeight: 'bold'},
  progressSection: {marginTop: '20px'},
  infoCard: {border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px'},
  infoTitle: {fontSize: '18px', fontWeight: 'bold'},
  infoContent: {fontSize: '14px'},
};

const InstructorCourseDetailPage: React.FC = () => {
  const {courseId} = useParams<{courseId: string}>();
  const [course, setCourse] = useState<ICourse | null>(null); // Add course state
  const [tasks, setTasks] = useState<ILearningTask[]>([]);
  const [studentsProgress, setStudentsProgress] = useState<IStudentProgressSummary[]>([]); // Replace with students progress
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Fetch course details
  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const courseData = await courseService.getCourseDetails(courseId);
        setCourse(courseData);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError('Failed to fetch course details');
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Use separate useEffect to fetch tasks only after course is loaded
  useEffect(() => {
    if (!courseId || !course) return;

    const fetchTasks = async () => {
      try {
        const tasksData = await learningTaskService.getAll({course: courseId});
        setTasks(tasksData);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        // Don't set error since we at least have course data
      }
    };

    fetchTasks();
  }, [courseId, course]);

  // Fetch students progress for this course
  const fetchStudentsProgress = useCallback(async () => {
    if (!courseId) return;

    try {
      const progressData = await progressService.fetchAllStudentsProgress(courseId);
      setStudentsProgress(progressData);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch students progress:', err);
      setIsLoading(false);
      // Continue to show UI even if progress fetch fails
    }
  }, [courseId]);

  // Call fetchStudentsProgress after course is loaded
  useEffect(() => {
    if (course) {
      fetchStudentsProgress();
    }
  }, [course, fetchStudentsProgress]);

  if (isLoading) {
    return <div>Loading course details...</div>;
  }

  if (error || !course) {
    return <div>Error: {error || 'Course not found'}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{course.title}</h1>
        <p>{course.description}</p>
        <Link to={`/instructor/courses/${courseId}/edit`}>Edit Course</Link>
      </div>

      {studentsProgress.length > 0 && (
        <StudentsProgressSummary studentsProgress={studentsProgress} />
      )}

      {course && (
        <div style={styles.infoSection}>
          <InfoCard title="Created By">
            {course.instructor_name || 'Unknown'}
          </InfoCard>

          <InfoCard title="Status">{course.status || 'Not specified'}</InfoCard>

          <InfoCard title="Prerequisites">
            {Array.isArray(course.prerequisites)
              ? course.prerequisites.join(', ')
              : course.prerequisites || 'None'}
          </InfoCard>

          <InfoCard title="Learning Objectives">
            {Array.isArray(course.learning_objectives)
              ? course.learning_objectives.join(', ')
              : course.learning_objectives || 'No learning objectives specified'}
          </InfoCard>
        </div>
      )}

      <div style={styles.tasksSection}>
        <h2 style={styles.tasksTitle}>Course Tasks</h2>
        {tasks.length > 0 ? (
          <TasksList tasks={tasks} />
        ) : (
          <Typography variant="body1">No tasks available for this course.</Typography>
        )}
      </div>
    </div>
  );
};

// Move component definitions outside of the main component
interface IStudentsProgressSummaryProps {
  studentsProgress: IStudentProgressSummary[];
}

const StudentsProgressSummary: React.FC<IStudentsProgressSummaryProps> = ({studentsProgress}) => {
  const averageProgress = studentsProgress.length > 0
    ? studentsProgress.reduce(
      // Use progress property instead of completion_rate
      (acc, student) => acc + ((student.progress || 0) / 100), 0
    ) / studentsProgress.length * 100
    : 0;

  return (
    <div style={styles.progressSection}>
      <h2>Students Progress</h2>
      <p>Total Students: {studentsProgress.length}</p>
      <p>Average Progress: {averageProgress.toFixed(1)}%</p>
      {/* Add more student analytics here */}
    </div>
  );
};

interface TasksListProps {
  tasks: ILearningTask[];
}

const TasksList: React.FC<TasksListProps> = ({tasks}) => {
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <strong>{task.title}</strong> - {task.description}
        </li>
      ))}
    </ul>
  );
};

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({title, children}) => {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoTitle}>{title}</div>
      <div style={styles.infoContent}>{children}</div>
    </div>
  );
};

export default InstructorCourseDetailPage;
