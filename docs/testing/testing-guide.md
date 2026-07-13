# MPEP Testing Guide

This guide establishes testing instructions, mock specifications, and verification boundaries.

## 1. Unit Tests (`*.test.ts`)
- All backend domains must write unit tests using Vitest.
- Mock external APIs (database, network) to prevent side effects.
- Clean mock states after every spec file using `beforeEach` with `mockReset()`.

## 2. Platform & Mobile Layout Tests
- Mock user agents inside test suites using browser environments.
- Verify component exports, router contexts, and viewport scaling logic.
- Example (`src/lib/mobile/engine.test.ts`):
  ```typescript
  import { isMobileUserAgent } from "./engine";
  
  it("determines user agent checks safely inside node/jsdom environments", () => {
    const isMobile = isMobileUserAgent();
    expect(typeof isMobile).toBe("boolean");
  });
  ```

## 3. End-to-End Specs
- Playwright E2E test specs reside inside `/e2e`.
- Run E2E tests using `npm run test:e2e`.
- All routes must load cleanly without causing internal redirection loops or database connection timeouts.
