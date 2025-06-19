import { Factory } from 'fishery';
import { INotification } from '@/components/Notifications/types';

export const notificationFactory = Factory.define<INotification>(({ sequence, associations }) => ({
  id: sequence,
  message: associations.message ?? `Notification message ${sequence}`,
  title: associations.title,
  severity: associations.severity ?? 'info',
  duration: associations.duration ?? 3000,
  priority: associations.priority ?? 1,
  onClose: associations.onClose,
}));
