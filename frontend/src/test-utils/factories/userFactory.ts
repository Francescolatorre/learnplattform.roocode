// src/test-utils/factories/userFactory.ts
import { Factory } from 'fishery';

import { IUser, UserRoleEnum } from '@/types/userTypes';

export const userFactory = Factory.define<IUser>(({ sequence, params }) => ({
  id: `user-${sequence}`,
  username: `testuser${sequence}`,
  email: `test${sequence}@example.com`,
  role: UserRoleEnum.STUDENT,
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-02T12:00:00Z',
  is_active: true,
  ...params,
}));
