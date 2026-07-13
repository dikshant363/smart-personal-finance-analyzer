/**
 * PWA Engine — Registration and lifecycle management
 * Sprint 11.2 — Progressive Web Application Platform
 */

export type SWRegistrationStatus = "unsupported" | "registered" | "failed";

export interface PWAEngineOptions {
  onUpdateAvailable?: (version: string) => void;
  onInstalled?: () => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

/**
 * Registers the service worker and sets up lifecycle event listeners.
 */
export async function registerServiceWorker(
  options: PWAEngineOptions = {}
): Promise<SWRegistrationStatus> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return "unsupported";
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("[PWA] Service worker registered:", reg.scope);

    // Listen for messages from the SW
    navigator.serviceWorker.addEventListener("message", (event: MessageEvent) => {
      if (event.data?.type === "SW_UPDATED" && options.onUpdateAvailable) {
        options.onUpdateAvailable(event.data.version ?? "");
      }
    });

    // Network status listeners
    window.addEventListener("online", () => options.onOnline?.());
    window.addEventListener("offline", () => options.onOffline?.());

    return "registered";
  } catch (err) {
    console.error("[PWA] Service worker registration failed:", err);
    return "failed";
  }
}

/**
 * Checks if the app is running as a standalone PWA.
 */
export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

/**
 * Checks current network connectivity.
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

/**
 * Requests background sync registration for an entity type.
 */
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    // @ts-expect-error: BackgroundSync API not yet in all TS lib definitions
    if (reg.sync) {
      // @ts-expect-error: Same as above
      await reg.sync.register(tag);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Requests push notification permission.
 * Returns the permission state: "granted" | "denied" | "default"
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

/**
 * Shares content using the Web Share API with clipboard fallback.
 */
export async function shareContent(data: ShareData): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator === "undefined") return "failed";
  if (navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch {
      return "failed";
    }
  }
  // Clipboard fallback
  if (navigator.clipboard && data.url) {
    try {
      await navigator.clipboard.writeText(data.url);
      return "copied";
    } catch {
      return "failed";
    }
  }
  return "failed";
}
