export interface DomainEvent {
  id: string;
  type: string;
  version: string;
  timestamp: string;
  workspaceId: string;
  payload: any;
}

type EventHandler = (event: DomainEvent) => void | Promise<void>;

class LocalEventBus {
  private subscribers: Record<string, EventHandler[]> = {};
  private eventStore: DomainEvent[] = [];
  private deadLetterQueue: { event: DomainEvent; error: string }[] = [];

  public subscribe(type: string, handler: EventHandler) {
    if (!this.subscribers[type]) {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push(handler);
  }

  public async publish(event: DomainEvent) {
    this.eventStore.push(event);

    const handlers = this.subscribers[event.type] || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err: any) {
        this.deadLetterQueue.push({ event, error: err.message || "Unknown error" });
      }
    }
  }

  public replay(type?: string) {
    const events = type
      ? this.eventStore.filter((e) => e.type === type)
      : this.eventStore;

    for (const event of events) {
      const handlers = this.subscribers[event.type] || [];
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (err: any) {
          // Log replay failures silently
        }
      }
    }
  }

  public getStore(): DomainEvent[] {
    return this.eventStore;
  }

  public getDlq() {
    return this.deadLetterQueue;
  }

  public clear() {
    this.eventStore = [];
    this.subscribers = {};
    this.deadLetterQueue = [];
  }
}

export const eventBus = new LocalEventBus();
