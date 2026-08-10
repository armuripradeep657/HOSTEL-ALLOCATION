export interface QueuedAction {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body: any;
  timestamp: number;
  description: string;
}

const STORAGE_KEY = 'hostel_pending_sync_actions';

export function getOfflineQueue(): QueuedAction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse offline action queue:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: QueuedAction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save offline action queue:', e);
  }
}

export function addToOfflineQueue(action: {
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body: any;
  description: string;
}): QueuedAction {
  const queue = getOfflineQueue();
  const newAction: QueuedAction = {
    ...action,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
  queue.push(newAction);
  saveOfflineQueue(queue);
  
  // Dispatch custom event so the UI can listen and update instantly
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: queue }));
  
  return newAction;
}

export function removeFromOfflineQueue(id: string): void {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  saveOfflineQueue(filtered);
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: filtered }));
}

/**
 * Iterates over the queued offline actions and sends them to the server.
 * Retries on any failure. Stops processing the rest of the queue if one fails to preserve order,
 * unless it is a 4xx client error (e.g. 404 or 400 validation error) where retrying won't help.
 */
export async function syncOfflineQueue(
  onSuccess?: (action: QueuedAction) => void,
  onFailure?: (action: QueuedAction, error: any) => void
): Promise<{ successCount: number; failedCount: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { successCount: 0, failedCount: 0 };
  }

  let successCount = 0;
  let failedCount = 0;
  const remainingActions: QueuedAction[] = [];

  for (const action of queue) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(action.body)
      });

      if (response.ok) {
        successCount++;
        if (onSuccess) {
          onSuccess(action);
        }
      } else {
        // If it's a client error (400-499), it's probably malformed and retrying will keep failing.
        // So we discard it or report it. If it's a server error (5xx or connection), we keep it and halt queue.
        if (response.status >= 400 && response.status < 500) {
          console.warn(`Discarding invalid offline action (${action.description}): Status ${response.status}`);
          failedCount++;
          if (onFailure) {
            onFailure(action, new Error(`HTTP ${response.status}`));
          }
        } else {
          // Keep this and all subsequent actions to preserve order
          throw new Error(`Server returned status ${response.status}`);
        }
      }
    } catch (err) {
      console.error(`Sync failed for action (${action.description}):`, err);
      // Keep this and the rest of the queue
      const currentIndex = queue.indexOf(action);
      const leftOver = queue.slice(currentIndex);
      saveOfflineQueue([...remainingActions, ...leftOver]);
      window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: [...remainingActions, ...leftOver] }));
      
      if (onFailure) {
        onFailure(action, err);
      }
      return { 
        successCount, 
        failedCount: failedCount + leftOver.length 
      };
    }
  }

  // If everything succeeded or was discarded
  saveOfflineQueue([]);
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: [] }));
  return { successCount, failedCount };
}
