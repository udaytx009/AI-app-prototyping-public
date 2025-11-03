import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useGoalStore } from './store';

export function useReminders() {
  const { goals } = useGoalStore();

  const requestPermission = useCallback(() => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission === 'granted') {
       toast.success('Notification permission already granted.');
       return;
    }
    
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast.success('Notification permission granted!');
        } else {
          toast.warning('Notification permission denied.');
        }
      });
    } else {
        toast.warning('Notifications are blocked. Please enable them in your browser settings.');
    }
  }, []);

  const showNotification = useCallback((goalName: string) => {
    if (Notification.permission === 'granted') {
      new Notification('Goal Due!', {
        body: `Your goal "${goalName}" is due now.`,
        icon: '/favicon.ico', // Optional: add an icon
      });
    } else {
      // Fallback to a toast notification if permission is not granted
      toast.info(`Your goal "${goalName}" is due!`, {
          description: 'Enable notifications to get reminders directly on your desktop.',
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      goals.forEach((goal) => {
        if (goal.notify && goal.dueDate) {
          const dueDate = new Date(goal.dueDate);
          // Check if the goal is due in the current minute
          if (dueDate <= now && now.getTime() - dueDate.getTime() < 60000) {
            showNotification(goal.name);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [goals, showNotification]);

  return { requestPermission };
}
