# MPEP Developer Guide

This document details how developers should implement features for the Multi-Platform Experience Platform (MPEP).

## 1. Local Device Access Rules
Do **NOT** call browser-specific window APIs (e.g. `window.localStorage`, `window.navigator.share`) directly inside core business libraries. Always resolve them through the device capability abstraction handlers located in `src/lib/mobile/device.ts`.
- **Reason**: Direct window calls crash during React Server Components (RSC) parsing and server-side builds.
- **Example**:
  ```typescript
  import { copyToClipboard } from "@/lib/mobile";
  
  async function handleShare(text: string) {
    const success = await copyToClipboard(text);
    if (success) {
      // Trigger success alerts
    }
  }
  ```

## 2. Progressive Web App Registry
The PWA service worker lifecycle is bootstrapped inside the root layout file using `<PWARegistry />`.
- Local Service Worker script is served from `/sw.js` (compiled inside `public/sw.js`).
- If you edit caching routes, update the cache version key `CACHE_NAME = "mpep-cache-vX"` to force clients to clear their state databases.

## 3. Offline Synchronizations
Offline operations use the sync queues system:
- When a user initiates a mutation while offline, queue the payload using `queueOfflineAction(userId, "CreateTransaction", payload)`.
- The synchronization engine will automatically pick it up and process it using `processOfflineSyncQueue(userId)` when network heartbeats resume.
- Enforce deduplication checks inside the syncer logic to prevent double mutations.
