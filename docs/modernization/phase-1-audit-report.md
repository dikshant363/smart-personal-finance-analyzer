# Phase 1: Complete Repository Audit & Reorganization Report

This report presents a thorough review of the repository architecture, naming conventions, coding standards, performance, security, and open-source readiness.

---

## 1. Executive Summary
- **Current Version**: `v10.0.0`
- **Target Architecture**: strict Presentation → Platform → Application → Domain → Infrastructure layering.
- **Goal**: Transition from a collection of platforms and packages into a world-class open-source personal finance monorepo defaulted to India-First parameters.
- **Audit Conclusion**: The repository is functional and builds successfully (all Vitest and Playwright e2e suites pass). However, significant architectural layering leaks, mock cryptography claims, naming inconsistencies, and monorepo structure fragmentation exist. These will be addressed in subsequent modernization phases.

---

## 2. Repository Inventory
The workspace is organized as a multi-platform monorepo with Next.js web application, native platform shells, and local helper npm packages:

- **Applications (`apps/` and `finance-app/`)**:
  - `finance-app/`: Next.js web portal (acting as the central backend API and reference PWA).
  - `apps/android/`: Native Jetpack Compose presentation shell.
  - `apps/ios/`: Native SwiftUI presentation shell.
  - `apps/desktop/`: Tauri-powered native desktop container.
- **Shared Libraries (`packages/`)**:
  - `@finance/shared-types`: Canonical model interfaces.
  - `@finance/shared-models`: Shared utility formulas (net worth, goals).
  - `@finance/shared-validation`: Type validation structures and ranges.
  - `@finance/shared-config`: Extensible country configuration layer (defaults to `INDPack`).
  - `@finance/api-sdk`: Typed cross-platform HTTP request handlers.
  - `@finance/auth-sdk`: Secure credentials access subscriber.
  - `@finance/sync-sdk`: Offline action queue coordinator.
  - `@finance/ui`: Design tokens configuration.
- **Documentation (`docs/`)**:
  - Extensive guides partitioned across architecture, frontend, database, AI, security, testing, and operations.

---

## 3. Architecture Layering Assessment

We evaluated the codebase against the target: Presentation → Platform → Application → Domain → Infrastructure dependency direction.

### Layering Smells & Violations
1. **Prisma Coupled to Libs (Domain/Application Coupling to Infrastructure)**:
   - File `finance-app/src/lib/recurring/forecast.ts`, `detection.ts`, `analytics.ts`, `optimization.ts`, `schedule.ts`, and `repository.ts` import `prisma` from `@/lib/prisma` directly. Since recurring payment logic represents domain rules, directly binding them to DB access violates domain decoupling.
2. **Platform APIs Leaking into Libs**:
   - File `finance-app/src/lib/mobile/device.ts` mixes standard local storage access (`window.localStorage`) with in-memory fallbacks inside a single file. This should be decoupled into standard platform adapters.
3. **Implicit Dependency Injection**:
   - Multiple lib modules (e.g. `src/lib/offline/engine.ts`) use optional parameters like `db = prisma` directly in method signatures. This couples them to the global Prisma instance by default.

---

## 4. Naming Convention Audit

We observed inconsistent case conventions and abbreviations:
- **Folders**: Mixing kebab-case (`shared-config`, `api-sdk`) with flat names (`finance-app`).
- **Files**: Mixing camelCase (e.g., `useCurrency.ts`) with kebab-case (e.g., `offline-sync.ts`) and flat files (`engine.ts`).
- **Components**: Inconsistent suffixes.

---

## 5. India-First Compliance Review
- **Default Currency**: Properly configured to `INR` and using `₹` prefix throughout Next.js, Kotlin Compose, and Swift dashboards.
- **Number Formats**: Standard `Intl.NumberFormat('en-IN')` used inside `@finance/shared-models`.
- **Terminology**: The AI copilot, budgets, and dashboards successfully utilize Indian investment tags (SIP, PPF, EPF, NPS) and payment terms (UPI).

---

## 6. Security Findings

> [!CAUTION]
> **Base64 Encoding Claimed as Encryption**
> File `finance-app/src/lib/mobile/device.ts` contains `FallbackSecureStore` and `WebSecureStore` classes that utilize `atob()` and `btoa()` to read/write credentials to window localStorage. The comments reference this as "Base64 encryption" or "secure storage". Base64 is a public encoding format and offers **zero security protection**.
> This will be updated in Phase 4 to clearly document encoding behavior or implement real Web Crypto AES-GCM encryption.

---

## 7. Performance & Bundle Metrics
- **Bundle Virtualization**: Virtualization is missing from transaction list view containers, posing memory concerns under large sets.
- **Code Splitting**: The Next.js routing maps standard imports instead of dynamically importing lazy components.

---

## 8. Accessibility Findings
- **Focus States**: Several components rely on browser outline overrides without distinct accessibility focus styles.
- **Semantic HTML**: Some custom dashboard grids use `<div>` tables instead of standard screen-reader recognizable structures.

---

## 9. Testing & Coverage Gaps
- **Playwright e2e coverage**: Playwright tests only verify basic page loads and health checking routes. Core user flows like transaction creation, synchronization conflicts, and offline fallback scenarios require dedicated integration tests.

---

## 10. Prioritized Refactoring Roadmap

### 🔴 Critical (Phase 2 & 3)
- Rename files and packages to uniform kebab-case structures.
- Decouple Prisma database imports from domain logic engines.
- Refactor the Base64 mock storage encryption documentation to prevent false security compliance statements.

### 🟡 High (Phase 4 & 5)
- Standardize the monorepo workspace configurations under Turborepo.
- Improve Playwright integration test suite coverage.

---

## 11. Proposed Git Delivery Branches
- **Phase 1 (Audit)**: `feature/modernization-phase-1-audit`
- **Phase 2 (Standardization)**: `feature/modernization-phase-2-standardization`
- **Phase 3 (Architecture)**: `feature/modernization-phase-3-architecture`
- **Phase 4 (Quality/Security)**: `feature/modernization-phase-4-quality`
- **Phase 5 (Monorepo)**: `feature/modernization-phase-5-monorepo`
- **Phase 6 (SDK Extraction)**: `feature/modernization-phase-6-sdk`
- **Phase 7 (Developer Portal)**: `feature/modernization-phase-7-portal`
- **Phase 8 (Release Prep)**: `feature/modernization-phase-8-release`
