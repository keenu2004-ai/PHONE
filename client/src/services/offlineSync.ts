import { attendanceApi } from './api';

export interface PendingAttendance {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

const STORAGE_KEY = 'teamnest_offline_attendance_queue';

export const offlineSync = {
  // Add a pending check-in to localStorage queue
  queueCheckIn: (user_id: string, lat: number, lng: number): PendingAttendance => {
    const queue = offlineSync.getQueue();
    const item: PendingAttendance = {
      id: Math.random().toString(36).substring(2, 9),
      user_id,
      lat,
      lng,
      timestamp: new Date().toISOString(),
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return item;
  },

  // Get current queue
  getQueue: (): PendingAttendance[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Sync all queued check-ins to backend API
  syncPending: async (): Promise<number> => {
    const queue = offlineSync.getQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remainingQueue: PendingAttendance[] = [];

    for (const item of queue) {
      try {
        await attendanceApi.clockIn({
          user_id: item.user_id,
          lat: item.lat,
          lng: item.lng,
        });
        syncedCount++;
      } catch (error) {
        console.warn('Failed to sync offline attendance item:', item, error);
        remainingQueue.push(item);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue));
    return syncedCount;
  },

  // Initialize auto-sync on window online listener
  init: (onSynced?: (count: number) => void) => {
    // Sync on page load if online
    if (navigator.onLine) {
      offlineSync.syncPending().then((count) => {
        if (count > 0 && onSynced) onSynced(count);
      });
    }

    // Sync when coming back online
    window.addEventListener('online', async () => {
      console.log('🌐 Network reconnected! Syncing offline attendance queue...');
      const count = await offlineSync.syncPending();
      if (count > 0 && onSynced) onSynced(count);
    });
  },
};
