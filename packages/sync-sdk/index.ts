/**
 * Shared Offline Sync SDK — @finance/sync-sdk
 * Sprint 11.5: Handles offline actions storage, background queueing, and retry sync.
 */

export interface SyncItem {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: "transaction" | "budget" | "goal";
  payload: unknown;
  timestamp: number;
}

export class SyncQueueManager {
  private storageKey: string;
  private syncInProgress = false;

  constructor(userId: string) {
    this.storageKey = `finance_sync_queue_${userId}`;
  }

  public getQueue(): SyncItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public saveQueue(queue: SyncItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch {
      // Storage quota exceeded
    }
  }

  public enqueue(
    action: "CREATE" | "UPDATE" | "DELETE",
    entity: "transaction" | "budget" | "goal",
    payload: unknown
  ): SyncItem {
    const queue = this.getQueue();
    const item: SyncItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      entity,
      payload,
      timestamp: Date.now(),
    };
    queue.push(item);
    this.saveQueue(queue);
    return item;
  }

  /**
   * Processes the sync queue sequentially, calling the execute function for each action.
   */
  public async sync(
    executor: (item: SyncItem) => Promise<boolean>
  ): Promise<{ success: boolean; processed: number; failed: number }> {
    if (this.syncInProgress) {
      return { success: false, processed: 0, failed: 0 };
    }

    this.syncInProgress = true;
    const queue = this.getQueue();
    const remaining: SyncItem[] = [];
    let processed = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        const success = await executor(item);
        if (success) {
          processed++;
        } else {
          failed++;
          remaining.push(item);
        }
      } catch {
        failed++;
        remaining.push(item);
      }
    }

    this.saveQueue(remaining);
    this.syncInProgress = false;

    return {
      success: failed === 0,
      processed,
      failed,
    };
  }

  public clearQueue() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}
