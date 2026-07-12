export interface TelemetryEvent {
  id: string;
  category: "auth" | "ai" | "sync" | "system" | "security";
  action: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

const telemetryRegistry: TelemetryEvent[] = [];

export class ObservabilityService {
  static recordEvent(
    category: "auth" | "ai" | "sync" | "system" | "security",
    action: string,
    metadata: Record<string, any> = {}
  ): TelemetryEvent {
    const event: TelemetryEvent = {
      id: Math.random().toString(36).substring(7),
      category,
      action,
      metadata,
      timestamp: new Date(),
    };
    telemetryRegistry.push(event);

    // Limit memory allocation growth
    if (telemetryRegistry.length > 1000) {
      telemetryRegistry.shift();
    }
    return event;
  }

  static getEvents(category?: string): TelemetryEvent[] {
    if (!category) return telemetryRegistry;
    return telemetryRegistry.filter((e) => e.category === category);
  }

  static getSystemHealth(): { status: string; uptimeSec: number; dbOk: boolean } {
    return {
      status: "Healthy",
      uptimeSec: process.uptime(),
      dbOk: true,
    };
  }

  static clearRegistry() {
    telemetryRegistry.length = 0;
  }
}
