import React, { useEffect } from 'react';
import { useReminders } from 'utils/useReminders';
import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';

export function ReminderSystem() {
  const { requestPermission } = useReminders();

  useEffect(() => {
    // On mount, check if we need to ask for permission.
    // We'll ask if permission is not yet determined.
    if ('Notification' in window && Notification.permission === 'default') {
        // You could also trigger this on a button click
        // requestPermission();
    }
  }, [requestPermission]);

  // This component can also provide a button to manually trigger permission request
  return (
    <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={requestPermission} size="sm" variant="outline" className="rounded-full">
            <BellRing className="mr-2 h-4 w-4" />
            Enable Reminders
        </Button>
    </div>
  );
}
