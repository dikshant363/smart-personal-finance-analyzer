# Smart Personal Finance Analyzer — India-First Multi-Platform Experience Platform (MPEP)

This is the root of the **Smart Personal Finance Analyzer** monorepo, housing all platform applications and shared packages, configured by default for India-First operations.

---

## 🇮🇳 India-First Default Configuration

The platform defaults entirely to Indian financial jurisdictions:
- **Primary Currency**: Indian Rupee (`INR`, `₹`)
- **Formatting**: Indian Numbering System (Lakh/Crore groupings: e.g. `₹1,00,000` / `₹10,00,000`)
- **Financial Year**: 1 April – 31 March
- **Local Banking & Payments**: UPI-first transactional workflows and alerts.
- **Investments**: Priority support for Systematic Investment Plans (SIPs), Public Provident Fund (PPF), Employee Provident Fund (EPF), and National Pension System (NPS).

---

## Structure

```
/
├── finance-app/          # Next.js web application (primary platform)
├── apps/
│   ├── android/          # Kotlin/Jetpack Compose Android app
│   ├── ios/              # Swift/SwiftUI Apple app
│   └── desktop/          # Tauri 2 desktop app
└── packages/
    ├── shared-config/    # Extensible Country Configuration pack (defaults to INDPack)
    ├── shared-types/     # Canonical TypeScript DTOs for all clients
    ├── shared-models/    # Domain utilities (formatting, calculations)
    ├── shared-validation/# Validation rules and error codes
    ├── ui/               # Design tokens (colors, typography, spacing)
    ├── api-sdk/          # HTTP API client with retry/refresh
    ├── auth-sdk/         # Authentication session management
    └── sync-sdk/         # Offline sync engine
```

## Architecture Principle

> **Every platform uses the same backend. Business logic lives on the server. Clients are thin presentation layers.**

All client platforms (Web, Android, iOS, Desktop) consume the identical REST API. No platform has a separate backend. No business logic is duplicated across clients.

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
| Web | Next.js + TypeScript | v1.0.0 |
| PWA | Service Worker | v1.0.0 |
| Android | Kotlin + Jetpack Compose | v1.0.0 |
| iOS | Swift + SwiftUI | v1.0.0 |
| Desktop | Tauri 2 + Rust | v1.0.0 |
