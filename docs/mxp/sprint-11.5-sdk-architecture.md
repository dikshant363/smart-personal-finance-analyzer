# Sprint 11.5 — Cross-Platform SDK & Synchronization Platform (CSSP)
# Architecture Documentation

## Overview

Sprint 11.5 delivers the shared, platform-agnostic SDK libraries under the `/packages/` directory. These libraries eliminate code duplication and form the unified client core API for all current and future platforms.

## Shared SDK Packages (Sprint 11.5)

### `@finance/api-sdk`
Platform-agnostic HTTP Fetch client mapping all shared REST endpoints:
- Automatic token refresh logic via injection hook (`onTokenExpired`)
- Rate-limit aware backoff (linear 1s to 3s retry interval)
- Connection failure safety guards

### `@finance/auth-sdk`
Canonically manages:
- Current user credentials profile representation
- Authorization credentials lifecycle (`setSession`, `clearSession`)
- State listener subscriptions (`subscribe`) for UI data updates

### `@finance/sync-sdk`
Production offline synchronizer engine:
- Queueing database logic (`enqueue`) for CREATE/UPDATE/DELETE payloads
- Sequential resolver (`sync(executor)`) mapping pending states back to the network
- Offline data serialization

## Directory Structure

```
packages/
├── api-sdk/
│   ├── index.ts              # Fetch client wrapper class
│   ├── index.test.ts         # Authentication / backoff tests
│   └── package.json
├── auth-sdk/
│   ├── index.ts              # Subscriber manager
│   ├── index.test.ts         # Profile memory storage tests
│   └── package.json
└── sync-sdk/
    ├── index.ts              # Sequential queues manager
    ├── index.test.ts         # Synchronization runner tests
    └── package.json
```

## Git Branch
`feature/sprint-11.5-sdk`

## Version Tag
`v11.5.0`
