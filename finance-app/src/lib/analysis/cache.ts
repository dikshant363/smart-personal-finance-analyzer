const CACHE_TTL_MS = 5 * 60 * 1000;

const store = new Map<string, { value: unknown; ts: number }>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts >= CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached(key: string, value: unknown): void {
  store.set(key, { value, ts: Date.now() });
}

export function cacheKey(userId: string, scope: string): string {
  return `${userId}:${scope}`;
}
