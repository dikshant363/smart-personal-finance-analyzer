# 19, 36, 37, 39. Testing & Quality Gates

This document defines the testing strategy, test classifications, mock policies, and validation checklists for the Smart Personal Finance Analyzer.

## Testing Strategy & Coverage
1. **Unit Tests (`*.test.ts`)**: Validate single functions or objects in absolute isolation. All database actions or network integrations must be mocked (e.g. using `vi.mock`).
2. **Integration Tests**: Verify collaboration boundaries between multiple modules (e.g. `eventBus` publishes triggering `AutomationWorkflow` evals).
3. **End-to-End Tests (`e2e/*.spec.ts`)**: Playwright automation browser tests that run against the compiled, deployed app. Verifies core navigation pages (like `/login`) and API responses (like `/api/health`).
4. **Accessibility Audit Specs**: Unit assertions checking contrast elements and keyboard event triggers (`src/lib/accessibility/engine.test.ts`).

## Mocking Principles
- **Reset Mocks Globally**: To prevent test context pollution, test suites must explicitly call `mockReset()` on all mocked functions in a file-level `beforeEach` hook.
- **No Shared State**: Ensure in-memory cache layers (e.g. `ratesCache`) are cleared before every test using clean hooks (like `clearRatesCache()`).

## Test Style Guidelines

### Correct Vitest Assertions
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertAmount, clearRatesCache } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    exchangeRate: {
      findFirst: vi.fn(),
    },
  },
}));

beforeEach(() => {
  (prisma.exchangeRate.findFirst as any).mockReset();
  clearRatesCache();
});

describe("convertAmount", () => {
  it("converts amount using database record", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce({
      rate: 1.15,
      fromCurrency: "EUR",
      toCurrency: "USD",
    });

    const result = await convertAmount(100, "EUR", "USD");
    expect(result).toBeCloseTo(115);
  });
});
```

### Incorrect Assertions (Anti-pattern)
```typescript
// Anti-pattern: No beforeEach cleanup, persistent mock leaks to other tests, uses real prisma
import { convertAmount } from "./engine";

it("converts rate", async () => {
  const result = await convertAmount(100, "EUR", "USD");
  expect(result).toBe(115);
});
```

## Validation Checklist
- [ ] Every new source library has a corresponding `*.test.ts` file.
- [ ] No unit tests depend on an active PostgreSQL database connection.
- [ ] Test files run `mockReset()` on all imported prisma mocks inside `beforeEach`.
- [ ] Playwright E2E integration verification script runs successfully.
- [ ] Output verification compiles cleanly with zero linting or typescript compilation errors.
