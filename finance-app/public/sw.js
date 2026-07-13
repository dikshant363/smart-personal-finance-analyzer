/**
 * MPEP PWA Service Worker
 * Handles offline assets caching, cache versioning, and message-driven sync events.
 */

const CACHE_NAME = "mpep-cache-v1";
const OFFLINE_URLs = [
  "/offline-fallback",
  "/manifest.json",
  "/globals.css",
  "/icon.png"
];

self.addEventListener("install", (event) => {
  (event as any).waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLs);
    })
  );
  (self as any).skipWaiting();
});

self.addEventListener("activate", (event) => {
  (event as any).waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  (self as any).clients.claim();
});

self.addEventListener("fetch", (event: any) => {
  // Only intercept GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Cache successful assets
          if (response.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline landing page if HTML request fails
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/offline-fallback");
          }
          return new Response("Offline resource unavailable", { status: 503 });
        });
    })
  );
});

// Sync listener for queued mutations
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncOfflineTransactions());
  }
});

async function syncOfflineTransactions() {
  console.log("[Service Worker] Synchronizing offline transactions...");
  // Will be implemented dynamically in sync queue APIs
}
