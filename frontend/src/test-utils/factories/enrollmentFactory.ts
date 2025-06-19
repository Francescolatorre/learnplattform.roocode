import { Factory } from 'fishery';
import { ICourseEnrollment } from '@/types/entities';
import { IUser } from '@/types/userTypes';
import { ICourse } from '@/types/course';

export const enrollmentFactory = Factory.define<ICourseEnrollment>(
  ({ sequence, associations }) => ({
    id: sequence,
    user: associations.user ?? 1,
    course: associations.course ?? 1,
    enrollment_date: new Date().toISOString(),
    status: 'active',
    settings: null,
    user_details: associations.user_details as IUser | undefined,
    course_details: associations.course_details as ICourse | undefined,
    progress_percentage: '0',
  })
);
