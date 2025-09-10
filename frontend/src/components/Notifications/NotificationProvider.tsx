import React, { createContext, useCallback, useContext, useReducer } from 'react';

import { NotificationToast } from './NotificationToast';
import { INotification, NotificationContextType } from './types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let idCounter = 0;
export const resetIdCounter = () => {
  idCounter = 0;
};

export interface NotificationProviderProps {
  children: React.ReactNode;
  maxVisible?: number;
  position?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' };
  defaultDuration?: number;
}

type NotificationState = { all: INotification[] };

type NotificationAction =
  | { type: 'ADD'; notification: Omit<INotification, 'id'>; id: number; defaultDuration: number }
  | { type: 'DISMISS'; id: number };

function sortNotifications(notifications: INotification[]): INotification[] {
  return [...notifications].sort((a, b) => {
    const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
    return priorityDiff !== 0 ? priorityDiff : b.id - a.id;
  });
}

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'ADD': {
      const newNotif: INotification = {
        ...action.notification,
        id: action.id,
        duration: action.notification.duration ?? action.defaultDuration,
      };
      return { all: [...state.all, newNotif] };
    }
    case 'DISMISS': {
      const notif = state.all.find(n => n.id === action.id);
      if (notif?.onClose) notif.onClose();
      return { all: state.all.filter(n => n.id !== action.id) };
    }
    default:
      return state;
  }
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxVisible = 3,
  position = { vertical: 'bottom', horizontal: 'right' },
  defaultDuration = 6000,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, { all: [] });

  const addNotification = useCallback(
    (notification: Omit<INotification, 'id'>) => {
      dispatch({
        type: 'ADD',
        notification,
        id: idCounter++,
        defaultDuration,
      });
    },
    [defaultDuration]
  );

  const dismissNotification = useCallback((id: number) => {
    dispatch({ type: 'DISMISS', id });
  }, []);

  // Compute active and queue from all notifications
  const sorted = sortNotifications(state.all);
  const active = sorted.slice(0, maxVisible);
  // const _queue = sorted.slice(maxVisible); // For potential future queue management

  const contextValue: NotificationContextType = {
    addNotification,
    dismissNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationToast
        notifications={active}
        onDismiss={dismissNotification}
        position={position}
      />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return ctx;
};
