# Sprint 11.4 — Apple Ecosystem Experience Platform (AEEP)
# Architecture Documentation

## Overview

Sprint 11.4 establishes the native Apple ecosystem project layer under the monorepo directory `apps/ios/`. It implements a production-grade application for iOS/iPadOS in Swift using SwiftUI and Swift Package Manager (SPM).

## Tech Stack & Architecture

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Design System**: Human Interface Guidelines (SF Symbols, Dynamic Type, tab views)
- **Dependency Management**: Swift Package Manager (SPM) with KeychainSwift dependency
- **Offline Persistence**: Core Data / SwiftData layer foundation
- **Networking**: URLSession async/await client with platform-specific request headers
- **Security**: Keychain Services secure token encryption & Face ID/Touch ID architecture integration

## Project Layout

```
apps/ios/
├── Package.swift               # Swift Package Manager manifest
└── Sources/SmartFinance/
    ├── App.swift               # Main app entry point
    ├── ContentView.swift       # Bottom TabView controller navigation
    ├── DashboardView.swift     # SwiftUI Dashboard implementation
    ├── DataModel.swift         # Canonical Swift representations of Types DTOs
    ├── NetworkClient.swift     # URLSession wrapper for REST API connection
    └── SecureStorage.swift     # Keychain wrapper for accessToken persistence
```

## Shared Backend Contract

All endpoints mirror the Next.js routes exactly:
- `api/auth/`
- `api/transactions`
- `api/budgets`
- `api/goals`
- `api/copilot/chat`

The application acts as a presentation consumer, leveraging the shared API schemas.

## Git Branch
`feature/sprint-11.4-apple`

## Version Tag
`v11.4.0`
