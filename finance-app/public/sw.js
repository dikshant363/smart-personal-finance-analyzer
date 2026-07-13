/**
 * Smart Personal Finance Analyzer — Production PWA Service Worker
 * Sprint 11.2: Progressive Web Application Platform (PWAP)
 *
 * Caching Strategies:
 * - Static assets: CacheFirst (immutable build artifacts)
 * - API responses: NetworkFirst with 5s timeout (stale-while-revalidate fallback)
 * - Navigation: NetworkFirst → offline-fallback page
 * - Images/icons: StaleWhileRevalidate
 *
 * Features:
 * - Versioned cache with automatic stale cache cleanup
 * - Update detection via postMessage to connected clients
 * - Background sync for queued mutations
 * - Push notification handling
 */

const SW_VERSION = "11.2.0";
const CACHE_STATIC = `finance-static-v${SW_VERSION}`;
const CACHE_RUNTIME = `finance-runtime-v${SW_VERSION}`;
const CACHE_API = `finance-api-v${SW_VERSION}`;
const ALL_CACHES = [CACHE_STATIC, CACHE_RUNTIME, CACHE_API];

const STATIC_ASSETS = [
  "/offline-fallback",
  "/manifest.json",
  "/icon.png",
  "/icon-192.png",
  "/icon-512.png",
];

const API_CACHE_ROUTES = [
  "/api/transactions",
  "/api/budgets",
  "/api/goals",
  "/api/forecasts",
  "/api/assets",
  "/api/liabilities",
];

const NETWORK_TIMEOUT_MS = 5000;

// ─── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log(`[SW ${SW_VERSION}] Installing...`);
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => {
        console.log(`[SW ${SW_VERSION}] Static assets cached`);
        return self.skipWaiting();
      })
  );
});

// ─── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log(`[SW ${SW_VERSION}] Activating, cleaning stale caches...`);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!ALL_CACHES.includes(key)) {
              console.log(`[SW] Deleting stale cache: ${key}`);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => {
        // Notify all clients that a new SW version is active
        return self.clients.matchAll({ type: "window" }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "SW_UPDATED", version: SW_VERSION });
          });
        });
      })
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip WebSocket / SSE
  if (request.headers.get("accept")?.includes("text/event-stream")) return;

  // 1. API routes → NetworkFirst with fallback to stale cache
  if (API_CACHE_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(networkFirstWithFallback(request, CACHE_API));
    return;
  }

  // 2. Static build assets (_next/static) → CacheFirst
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // 3. Images → StaleWhileRevalidate
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|gif)$/)
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_RUNTIME));
    return;
  }

  // 4. Navigation (HTML) → NetworkFirst → offline fallback
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(navigationFetch(request));
    return;
  }

  // 5. Default → NetworkFirst
  event.respondWith(networkFirstWithFallback(request, CACHE_RUNTIME));
});

// ─── Strategies ────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = cache.match(request);
  const networkFetch = fetch(request).then((fresh) => {
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  });
  return (await cached) || networkFetch;
}

async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Network timeout")), NETWORK_TIMEOUT_MS)
      ),
    ]);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Offline", cached: false }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function navigationFetch(request) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Network timeout")), NETWORK_TIMEOUT_MS)
      ),
    ]);
    if (response.ok) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/offline-fallback");
  }
}

// ─── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncOfflineQueue("transactions"));
  }
  if (event.tag === "sync-budgets") {
    event.waitUntil(syncOfflineQueue("budgets"));
  }
  if (event.tag === "sync-goals") {
    event.waitUntil(syncOfflineQueue("goals"));
  }
});

async function syncOfflineQueue(entity) {
  console.log(`[SW] Background sync: ${entity}`);
  try {
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => {
      client.postMessage({ type: "SYNC_STARTED", entity });
    });
    // The actual sync is delegated to the sync-sdk in the client window context
    // This just notifies clients to trigger their sync engine
  } catch (err) {
    console.error(`[SW] Sync failed for ${entity}:`, err);
  }
}

// ─── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const { title = "Finance Alert", body = "", icon = "/icon-192.png", tag, url } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: "/icon-192.png",
      tag: tag || "finance-notification",
      data: { url },
      actions: [{ action: "open", title: "Open App" }],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find((c) => c.url.includes(self.location.origin));
        if (existingClient) {
          existingClient.focus();
          existingClient.navigate(targetUrl);
        } else {
          self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Message Handler ───────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "GET_VERSION") {
    event.source?.postMessage({ type: "SW_VERSION", version: SW_VERSION });
  }
  if (event.data?.type === "CACHE_CLEAR") {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});
