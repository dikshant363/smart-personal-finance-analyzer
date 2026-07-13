"use client";

import { useEffect } from "react";
import { PWAInstallPrompt } from "@/components/pwa/InstallPrompt";
import { PWAUpdateManager } from "@/components/pwa/UpdateManager";
import { registerServiceWorker } from "@/lib/pwa/engine";

/**
 * PWA Registry — mounts all PWA infrastructure for the web application.
 * Sprint 11.2: Enhanced with install prompt, update manager, and full SW lifecycle.
 */
export function PWARegistry() {
  useEffect(() => {
    registerServiceWorker({
      onUpdateAvailable: (version) => {
        console.log(`[PWA] Update available: ${version}`);
      },
      onOnline: () => {
        console.log("[PWA] Connection restored");
        // Trigger background sync when back online
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            // @ts-expect-error BackgroundSync not in all TS defs
            reg.sync?.register("sync-transactions").catch(() => {});
          });
        }
      },
      onOffline: () => {
        console.log("[PWA] Connection lost — offline mode active");
      },
    });
  }, []);

  return (
    <>
      <PWAUpdateManager />
      <PWAInstallPrompt />
    </>
  );
}
