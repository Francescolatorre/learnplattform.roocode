//src/store/courseStore.ts

import {create} from 'zustand';

import {ICourse} from '@/types/course';
// Importing the ICourse type from the course module

interface ICourseState {
  courses: ICourse[];
  addCourse: (course: ICourse) => void;
  removeCourse: (courseId: number) => void;
}

const useCourseStore = create<ICourseState>(set => ({
  courses: [],
  addCourse: (course: ICourse) => set(state => ({...state, courses: [...state.courses, course]})),
  removeCourse: (courseId: number) =>
    set(state => ({...state, courses: state.courses.filter(c => c.id !== courseId)})),
}));

export default useCourseStore;
