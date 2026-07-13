"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * PWA Install Prompt Component
 * Sprint 11.2 — Progressive Web Application Platform
 *
 * Shows a beautiful install banner for Chromium-based browsers.
 * Falls back gracefully on Safari with manual instructions.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showSafariBanner, setShowSafariBanner] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (don't re-show within 7 days)
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Detect Safari on iOS/macOS (no beforeinstallprompt)
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isSafari && isIOS) {
      setShowSafariBanner(true);
      return;
    }

    // Listen for Chrome/Edge install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setShowBanner(false);
    setShowSafariBanner(false);
  }, []);

  if (isInstalled || (!showBanner && !showSafariBanner)) return null;

  if (showSafariBanner) {
    return (
      <div
        id="pwa-safari-banner"
        role="dialog"
        aria-label="Install app on Safari"
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        style={{
          background: "rgba(15,15,35,0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-start gap-3">
          <div style={{ fontSize: "2rem" }}>📱</div>
          <div className="flex-1">
            <h3 style={{ color: "#c7d2fe", fontWeight: 700, marginBottom: "4px", fontSize: "0.95rem" }}>
              Add to Home Screen
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.8rem", lineHeight: 1.5 }}>
              Tap the <strong>Share</strong> button{" "}
              <span role="img" aria-label="Share">⬆️</span>{" "}
              then &ldquo;Add to Home Screen&rdquo; for the best experience.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="pwa-install-banner"
      role="dialog"
      aria-label="Install Finance Analyzer app"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      style={{
        background: "rgba(15,15,35,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="flex items-center gap-3 mb-4">
        {/* App icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "linear-gradient(135deg,#6366f1,#4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem", flexShrink: 0,
        }}>
          💰
        </div>
        <div>
          <h3 style={{ color: "#e0e7ff", fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>
            Install Finance Analyzer
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
            Works offline · Fast · No app store needed
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{ marginLeft: "auto", color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem" }}
        >
          ×
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          id="pwa-install-btn"
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "linear-gradient(135deg,#6366f1,#4f46e5)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Install App
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: "10px 16px",
            background: "rgba(75,85,99,0.3)",
            border: "1px solid rgba(75,85,99,0.5)",
            borderRadius: 10,
            color: "#9ca3af",
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
