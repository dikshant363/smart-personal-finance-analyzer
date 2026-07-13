export type CircuitState = "Closed" | "Open" | "Half-Open";

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerError";
  }
}

export class ResilienceService {
  private static state: CircuitState = "Closed";
  private static failureCount = 0;
  private static lastStateChange = Date.now();
  private static cacheStore: Record<string, { value: any; expiresAt: number }> = {};

  static async execute<T>(
    action: () => Promise<T>,
    fallback: () => T,
    retries = 3
  ): Promise<T> {
    if (this.state === "Open") {
      if (Date.now() - this.lastStateChange > 5000) {
        this.state = "Half-Open";
      } else {
        return fallback();
      }
    }

    let attempt = 0;
    while (attempt < retries) {
      try {
        const result = await action();
        if (this.state === "Half-Open") {
          this.state = "Closed";
          this.failureCount = 0;
        }
        return result;
      } catch (err) {
        attempt++;
        if (attempt >= retries) {
          this.failureCount++;
          if (this.failureCount >= 3) {
            this.state = "Open";
            this.lastStateChange = Date.now();
          }
          return fallback();
        }
      }
    }
    return fallback();
  }

  static setCache(key: string, value: any, ttlSeconds = 60) {
    this.cacheStore[key] = {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
  }

  static getCache(key: string): any | null {
    const entry = this.cacheStore[key];
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      delete this.cacheStore[key];
      return null;
    }
    return entry.value;
  }

  static clearCache() {
    this.cacheStore = {};
    this.state = "Closed";
    this.failureCount = 0;
  }
}
