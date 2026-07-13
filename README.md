# Smart Personal Finance Analyzer — Monorepo

This is the root of the **Smart Personal Finance Analyzer** monorepo, housing all platform applications and shared packages.

## Structure

```
/
├── finance-app/          # Next.js web application (primary platform)
├── apps/
│   ├── android/          # Kotlin/Jetpack Compose Android app
│   ├── ios/              # Swift/SwiftUI Apple app
│   └── desktop/          # Tauri 2 desktop app
└── packages/
    ├── shared-types/     # Canonical TypeScript DTOs for all clients
    ├── shared-models/    # Domain utilities (formatting, calculations)
    ├── shared-validation/# Validation rules and error codes
    ├── ui/               # Design tokens (colors, typography, spacing)
    ├── api-sdk/          # HTTP API client with retry/refresh
    ├── auth-sdk/         # Authentication session management
    ├── finance-sdk/      # Finance domain operations
    ├── ai-sdk/           # AI copilot interface
    └── sync-sdk/         # Offline sync engine
```

## Architecture Principle

> **Every platform uses the same backend. Business logic lives on the server. Clients are thin presentation layers.**

All client platforms (Web, Android, iOS, Desktop) consume the identical REST API. No platform has a separate backend. No business logic is duplicated across clients.

## Shared Backend

The Next.js application (`finance-app/`) serves as both:
1. The **web application** frontend
2. The **shared REST API backend** for all native clients

## Running the Web Application

```bash
cd finance-app
npm install
npm run dev
```

## Quality Gates (Web)

```bash
cd finance-app
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Platform Versions

| Platform | Language | Version |
|----------|----------|---------|
| Web | Next.js + TypeScript | v11.x |
| PWA | Service Worker | v11.x |
| Android | Kotlin + Jetpack Compose | v11.3+ |
| iOS | Swift + SwiftUI | v11.4+ |
| Desktop | Tauri 2 + Rust | v11.6+ |
