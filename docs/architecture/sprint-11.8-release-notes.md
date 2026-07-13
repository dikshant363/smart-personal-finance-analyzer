# Release Notes — Smart Personal Finance Analyzer
## Version: v2.0.0 (Global Ecosystem Launch)

Version **v2.0.0** marks the public release of the Multi-Platform Experience Platform (MXP) transformations, bringing uniform financial analysis experiences to Web, PWA, Android, Apple iOS, and Desktop client platforms.

---

## 1. Changelog

### Core Architecture & Shared SDKs
- Scaffolded standard monorepo folder layout.
- Created packages `@finance/shared-types`, `@finance/shared-models`, and `@finance/shared-validation` mapping canonical types and guard rules.
- Built reusable platform SDK clients: `@finance/api-sdk`, `@finance/auth-sdk`, and `@finance/sync-sdk`.

### Progressive Web App
- Production-grade service worker supporting caching strategies, versioned updates, push alerts, and background sync queues.
- Chromium install prompts banner and Safari iOS Add-to-Home-Screen fallbacks.

### Native Applications (Previews)
- Native Kotlin/Jetpack Compose Android app scaffold utilizing Hilt, Room caching, and Retrofit.
- Native Swift/SwiftUI iOS app shell utilizing SPM, URLSession, and Keychain secure token wrappers.
- Tauri 2 desktop wrap setup utilizing Rust commands system.

### Platform Extensibility
- Served OpenAPI 3.1 schema specs dynamically at `/api/openapi`.
- Implemented signature-verified webhooks manager and permission-bound plugin hook register.

---

## 2. Upgrade Guide

Existing users can upgrade seamlessly to `v2.0.0` by pulling latest master and installing package updates:
```bash
git checkout master
git pull
cd finance-app
npm install
npx prisma generate
npm run build
```

---

## 3. Rollback Guide

If production bugs are encountered, execution rollbacks to stable tag `v9.9.0` (pre-MXP transition) is supported:
```bash
# Rollback tag
git checkout v9.9.0
cd finance-app
npm install
npx prisma generate
npm run build
```
Since the database schema has not been modified (all client models continue to interact with identical endpoint parameters), no data migration scripts are required.
