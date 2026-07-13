"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * PWA Update Manager Component
 * Sprint 11.2 — Progressive Web Application Platform
 *
 * Detects when a new service worker is available and prompts the user
 * to apply the update safely (no data loss).
 */

export function PWAUpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SW_UPDATED") {
        setNewVersion(event.data.version ?? null);
        setUpdateAvailable(true);
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);

    // Also watch for new waiting SW
    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    });

    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  const applyUpdate = useCallback(async () => {
    setIsUpdating(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        // Wait for the new SW to take control before reloading
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        }, { once: true });
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  }, []);

  const dismiss = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div
      id="pwa-update-banner"
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "rgba(15,15,35,0.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: "14px",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        animation: "dropDown 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        whiteSpace: "nowrap",
      }}
    >
      <style>{`
        @keyframes dropDown {
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
      <span style={{ fontSize: "1.2rem" }}>🔄</span>
      <span style={{ color: "#c7d2fe", fontSize: "0.9rem", fontWeight: 500 }}>
        {newVersion ? `v${newVersion} available` : "Update available"}
      </span>
      <button
        onClick={applyUpdate}
        id="pwa-update-btn"
        disabled={isUpdating}
        aria-label="Apply app update now"
        style={{
          padding: "6px 14px",
          background: "linear-gradient(135deg,#6366f1,#4f46e5)",
          border: "none",
          borderRadius: 8,
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: isUpdating ? "wait" : "pointer",
          opacity: isUpdating ? 0.7 : 1,
        }}
      >
        {isUpdating ? "Updating…" : "Update now"}
      </button>
      <button
        onClick={dismiss}
        aria-label="Dismiss update notification"
        style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
      >
        ×
      </button>
    </div>
  );
}
