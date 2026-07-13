# Multi-Platform Experience Platform (MPEP) Guide

This guide defines how the Smart Personal Finance Analyzer powers multiple client platforms (Responsive Web, PWA, Mobile, Tablet, and Desktop) from a single shared codebase.

## 1. MPEP Responsive Navigation Shell
The application utilizes an adaptive layout shell component `src/components/layout/app-shell.tsx` that changes structural composition dynamically based on CSS media queries:

- **Mobile Viewports (`< 768px`)**:
  - Shows a compact **Bottom Navigation Bar** with primary actions (Dashboard, Transactions, Copilot, CommandCenter).
  - Displays a "More" navigation overlay drawer allowing access to all 40 specialized modules.
- **Tablet/iPad Viewports (`768px <= width < 1024px`)**:
  - Toggles to a slim vertical **Navigation Rail** displaying ONLY icon elements to save horizontal screen space.
- **Desktop/Laptops Viewports (`>= 1024px`)**:
  - Displays the full **Sidebar Navigation** with rich titles, group layouts, and icons.

## 2. Progressive Web App (PWA) Setup
The platform is fully installable on iOS, Android, and Desktop through PWA components:
- **App Manifest**: Defined inside `public/manifest.json`. Dictates colors, icon references, standalone display modes, and `/dashboard` entrypoints.
- **Service Worker (`public/sw.js`)**: Caches static shell elements, intercepts network requests to offer immediate asset loading, and provides `/offline-fallback` page fallback overlays.
- **PWA Registry (`src/components/pwa-registry.tsx`)**: Client registry bootstrap component ensuring clean client sw loading.

## 3. Device Capability Adapters
We isolate business domain algorithms from direct browser/device APIs using standard adapters in `src/lib/mobile/device.ts`:
- `secureStorage`: Encrypts/decrypts sensitive tokens in localStorage or local memory fallbacks.
- `isBiometricsAvailable`: Safely queries device capabilities for local fingerprint/face credentials validation.
- `copyToClipboard`: Handles writing textual information cleanly.
- `presentShareSheet`: Wraps browser Web Share API.
