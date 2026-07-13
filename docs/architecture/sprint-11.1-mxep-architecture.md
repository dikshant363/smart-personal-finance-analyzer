# Sprint 11.1 — Multi-Platform Experience Platform (MXEP)
# Architecture Documentation

## Overview

Sprint 11.1 establishes the foundational monorepo architecture that all subsequent platform sprints build upon. It introduces the shared package layer that decouples business logic from platform-specific presentation.

## Monorepo Layout

```
/
├── finance-app/                  # Next.js web + shared REST API backend
├── apps/
│   ├── android/                  # Sprint 11.3: Kotlin/Jetpack Compose
│   ├── ios/                      # Sprint 11.4: Swift/SwiftUI
│   └── desktop/                  # Sprint 11.6: Tauri 2
└── packages/
    ├── shared-types/             # Canonical DTOs (v11.1.0)
    ├── shared-models/            # Domain utilities (v11.1.0)
    ├── shared-validation/        # Validation rules + error codes (v11.1.0)
    ├── ui/                       # Design tokens (v11.1.0)
    ├── api-sdk/                  # Sprint 11.5: API client
    ├── auth-sdk/                 # Sprint 11.5: Auth session
    ├── finance-sdk/              # Sprint 11.5: Finance ops
    ├── ai-sdk/                   # Sprint 11.5: AI interface
    └── sync-sdk/                 # Sprint 11.5: Offline sync
```

## Core Principle

The existing `finance-app` Next.js application continues to serve as:
1. **Web frontend** — all existing routes and UI unchanged
2. **Shared REST API backend** — consumed by all native clients

**No platform ever gets its own backend. All APIs are shared.**

## Shared Packages (Sprint 11.1)

### `@finance/shared-types`
Canonical TypeScript interfaces for every domain entity. Any platform that reads a `TransactionDTO` speaks the same contract.

### `@finance/shared-models`
Business domain utilities: `calculateNetWorth()`, `formatCurrency()`, `goalProgressPercent()`, `budgetUtilization()`.

### `@finance/shared-validation`
Platform-agnostic validation rules. Native clients (Android/iOS) mirror these in their respective languages; this TypeScript version is authoritative.

### `@finance/ui`
Design tokens: HSL color palette, typography scale, spacing scale, border radius, shadows, animation easing. All platforms derive their visual identity from these tokens.

## API Contract

All client platforms consume the existing REST API:

| Domain | Base Path |
|--------|-----------|
| Auth | `/api/auth/` |
| Transactions | `/api/transactions/` |
| Budgets | `/api/budgets/` |
| Goals | `/api/goals/` |
| Forecasts | `/api/forecasts/` |
| AI Copilot | `/api/copilot/` |
| Net Worth | `/api/assets/`, `/api/liabilities/` |
| Notifications | `/api/notifications/` |

## Git Branch
`feature/sprint-11.1-mxep`

## Version Tag
`v11.1.0`
