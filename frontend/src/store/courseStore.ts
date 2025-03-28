import { create } from 'zustand';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface CourseState {
  courses: Course[];
  addCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
}

const useCourseStore = create<CourseState>(set => ({
  courses: [],
  addCourse: (course: Course) => set(state => ({ ...state, courses: [...state.courses, course] })),
  removeCourse: (courseId: string) =>
    set(state => ({ ...state, courses: state.courses.filter(course => course.id !== courseId) })),
}));

export default useCourseStore;
