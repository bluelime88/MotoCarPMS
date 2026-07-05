// Local scheduled notifications for due services. Works in Expo Go (local only).
import * as Notifications from 'expo-notifications';
import type { MaintenanceRecord, Vehicle } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Schedule an alert on the due date (9am). Returns the notification id, or
// undefined if there's no due date or it's already past.
export async function scheduleDue(
  vehicle: Vehicle,
  record: MaintenanceRecord
): Promise<string | undefined> {
  if (!record.nextDueDate) return undefined;
  const when = new Date(record.nextDueDate + 'T09:00:00');
  if (when.getTime() <= Date.now()) return undefined;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${vehicle.brand} ${vehicle.model} — service due`,
      body: `${record.type} is due today.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

export async function cancel(id?: string): Promise<void> {
  if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}
