export interface MetricEntry {
  key: string;
  durationMs: number;
  timestamp: Date;
}

const metricsLog: MetricEntry[] = [];
const cacheStorage = new Map<string, { value: any; expiry: number }>();

export class PerformanceManager {
  static logMetric(key: string, durationMs: number) {
    metricsLog.push({
      key,
      durationMs,
      timestamp: new Date(),
    });
    // Keep max logs size reasonable
    if (metricsLog.length > 500) {
      metricsLog.shift();
    }
  }

  static getMetricsSummary(): Record<string, { avgDurationMs: number; count: number }> {
    const totals: Record<string, { sum: number; count: number }> = {};
    for (const log of metricsLog) {
      if (!totals[log.key]) {
        totals[log.key] = { sum: 0, count: 0 };
      }
      totals[log.key].sum += log.durationMs;
      totals[log.key].count += 1;
    }

    const summary: Record<string, { avgDurationMs: number; count: number }> = {};
    for (const key in totals) {
      summary[key] = {
        avgDurationMs: Math.round(totals[key].sum / totals[key].count),
        count: totals[key].count,
      };
    }
    return summary;
  }

  static setCachedItem<T>(key: string, value: T, ttlMs = 60000) {
    cacheStorage.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  static getCachedItem<T>(key: string): T | null {
    const cached = cacheStorage.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      cacheStorage.delete(key);
      return null;
    }
    return cached.value as T;
  }

  static clearCache() {
    cacheStorage.clear();
  }
}
