// src/test-utils/factories/userFactory.ts
import { Factory } from 'fishery';
import { ICourse } from '../../types/course';

export const courseFactory = Factory.define<ICourse>(({ sequence, params }) => ({
  id: sequence,
  title: 'Test Course',
  description: 'This is a test course description',
  image_url: 'https://example.com/image.jpg',
  isEnrolled: false,
  isCompleted: false,
  instructor_name: 'Test Instructor',
  status: 'published',
  visibility: 'public',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-02T12:00:00Z',
  category: 'Test Category',
  difficulty_level: 'Beginner',
  ...params,
}));
