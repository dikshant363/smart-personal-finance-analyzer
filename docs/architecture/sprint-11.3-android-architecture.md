# Sprint 11.3 — Android Native Experience Platform (ANEP)
# Architecture Documentation

## Overview

Sprint 11.3 establishes the Android platform native architecture within the monorepo directory `apps/android/`. It implements a production-grade native Android application in Kotlin using Jetpack Compose and Material Design 3.

## Tech Stack & Architecture

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose (BOM 2024.11.00)
- **Design System**: Material Design 3 (Dynamic color scheme, edge-to-edge, adaptive layouts)
- **Dependency Injection**: Dagger Hilt
- **Local Persistence**: Room Database (with Sync Queue schema for offline operations)
- **Networking**: Retrofit 2 + OkHttp 4 (with Bearer Token and Platform Header interceptor)
- **Security**: EncryptedSharedPreferences (Android Keystore integration) + Android Biometric API
- **Background Tasks**: WorkManager (for transaction, budget, and goal synchronization)

## Directory Structure

```
apps/android/
├── build.gradle.kts          # Top-level build configuration
├── settings.gradle.kts       # Monorepo app configuration
├── gradle/
│   └── libs.versions.toml    # Centralized Gradle Version Catalog
└── app/
    ├── build.gradle.kts      # App-level build configurations & dependencies
    └── src/
        └── main/
            ├── AndroidManifest.xml # Permissions, Application, and Activity definitions
            └── kotlin/com/smartfinance/analyzer/
                ├── SmartFinanceApp.kt # Application configuration (Hilt entrypoint)
                ├── MainActivity.kt    # Single-activity container
                ├── data/
                │   ├── local/
                │   │   └── FinanceDatabase.kt # Room database, entities, and DAOs
                │   └── network/
                │       ├── FinanceApiClient.kt # Retrofit API Client factory
                │       ├── FinanceApiService.kt # REST API endpoints definitions
                │       └── TokenRepository.kt  # Secure credentials manager
                ├── domain/
                │   └── model/
                │       └── Models.kt           # Domain models mirroring DTOs
                └── ui/
                    ├── FinanceApp.kt           # Navigation configuration & bottom bar
                    ├── theme/
                    │   └── Theme.kt            # Material 3 colors & typography themes
                    ├── viewmodel/
                    │   └── ViewModels.kt       # State preservation & action handlers
                    └── screens/
                        ├── DashboardScreen.kt  # M3 Dashboard implementation
                        └── Screens.kt          # Transactions, budgets, goals, copilot, login
```

## Shared Backend Contract

All REST communication is handled by `FinanceApiService`, pointing directly to the existing Next.js backend API routes.
No business logic or database calculations are replicated natively; the Android client is fully decoupled and mirrors the presentation behavior of the PWA web experience.

## Git Branch
`feature/sprint-11.3-android`

## Version Tag
`v11.3.0`
