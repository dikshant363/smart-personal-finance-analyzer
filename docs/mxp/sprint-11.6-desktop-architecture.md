# Sprint 11.6 — Desktop Experience Platform (DXP)
# Architecture Documentation

## Overview

Sprint 11.6 introduces the native desktop client layer under the monorepo directory `apps/desktop/`. It uses Tauri 2 to bind a Rust OS-native backend shell together with the Next.js frontend, preventing electron-related bloated package distribution.

## Tech Stack & Architecture

- **Shell Framework**: Tauri 2 (Rust based)
- **Frontend Bundle**: Next.js client static exports (`out/` folder embedded as local assets)
- **Rust Commands**:
  - `get_system_info` — retrieves user environment statistics
  - `export_data_to_file` — executes file system writing operations natively
- **Security**: CSP configurations, context isolation parameters

## Directory Structure

```
apps/desktop/
├── tauri.conf.json           # Window properties and build targets configurations
└── src-tauri/
    ├── Cargo.toml            # Rust packages manager
    └── src/
        └── main.rs           # Rust main builder with custom Tauri command bindings
```

## Shared Backend Contract

The desktop application wraps the PWA bundle, delegating network calls to the shared REST APIs on the Next.js server.
No separate REST server logic is introduced natively.

## Git Branch
`feature/sprint-11.6-desktop`

## Version Tag
`v11.6.0`
