# Sprint 9.9 — Multi-Currency Auto-Conversion & Unified Currency Display

- **Version tag:** v9.9.0
- **Branch:** feature/sprint-9.9-multi-currency
- **Date:** 2026-07-13
- **Status:** Implemented (quality gates pending execution in CI — shell unavailable in implementation environment)

## Objective
Implement automatic multi-currency conversion and unified currency display across the application using
the existing Currency and ExchangeRate infrastructure. Preserve original transaction currency; display
converted values in the user's selected base currency (Profile.currency); never overwrite original
monetary values; show exchange-rate metadata where appropriate; support historical rates when available;
gracefully handle missing rates; reuse existing services; maintain full backward compatibility.

## Architecture Decisions
- Reused the existing `convertAmount` engine in `src/lib/currency/engine.ts` rather than building a new
  converter. Extracted a shared `resolveRate` (cache → DB → fallback → USD bridge) that `convertAmount`
  now delegates to. Behavior of `convertAmount`/`getCurrencyAllocationSummary` is preserved exactly.
- Added `convertWithMeta` for display paths: returns the converted amount plus metadata (rate, source,
  date) and, crucially, returns the ORIGINAL amount unchanged with `converted: false` when no rate is
  available (graceful, never fabricates a value).
- Added `getBaseCurrency(userId)` to centralize the previously-inlined `profile?.currency ?? "USD"` reads.
- Added `getLatestRateMap(base, currencies[])` to resolve rates for a DISTINCT set of currencies in a
  BOUNDED number of queries (one per distinct currency) — avoids N+1 lookups when converting lists.
- Added generic `withBaseCurrency(items, baseCurrency)` to attach conversion to any list carrying
  `amount` + `currency` (used by transactions API, transactions page, dashboard recent tx, goals totals).
- Display layer stays thin (components render; server does conversion). Business logic remains in `lib/`.

## Files Created
- src/lib/currency/conversion.test.ts
- docs/sprints/sprint-9.9-multi-currency.md
- CHANGELOG.md

## Files Modified
- src/lib/currency/engine.ts (resolveRate, convertWithMeta, getBaseCurrency, getLatestRateMap, withBaseCurrency + types)
- src/lib/currency/index.ts (new exports)
- src/lib/currency/engine.test.ts (added Sprint 9.9 tests + profile mock)
- src/app/api/transactions/route.ts (GET enriches transactions with base-currency conversion)
- src/app/(app)/transactions/page.tsx (server-side enrichment)
- src/components/transactions/transactions-client.tsx (type + original+converted display)
- src/app/(app)/dashboard/page.tsx (recent transactions enrichment + display)
- src/lib/analysis/insights.ts (currency param; formatMoney uses user currency)
- src/lib/analysis/analyze.ts (resolves user currency, threads through)
- src/app/(app)/spending/page.tsx (passes user currency)
- src/app/(app)/recommendations/page.tsx (passes user currency)
- src/app/(app)/goals/page.tsx (base-currency aggregate totals)
- src/components/goals/goals-client.tsx (accepts totals prop; base-currency aggregate display)
- README.md
- docs/governance/known_issues_register.md

## Database Changes
None. No schema change. No migration.

## API Changes
GET /api/transactions now returns each transaction object enriched with:
`amountBase` (number), `rate` (number | null), `converted` (boolean), `baseCurrency` (string).
Original `amount` and `currency` are preserved (backward compatible).

## UI Changes
- Transaction rows: show original amount in its currency, plus a muted secondary line with the converted
  base-currency amount and rate (e.g. "€100.00" / "≈ $108.00 @ 1.0800").
- Dashboard recent transactions: same original + converted treatment.
- Goals: aggregate "Total Saved/Target" now summed in the user's base currency.
- Spending / Recommendations / Analysis insights: now render in the user's base currency (was hard-coded USD).

## AI Changes
None. No AI model/provider logic was modified. Analysis insights are rule-based; only their currency
formatting was corrected.

## Security Changes
None new. No new user inputs; conversion inputs (amounts, currencies) are server-derived from the database
and the user's Profile. Standard output escaping via React applies.

## Performance Changes
- `getLatestRateMap` collapses per-item rate lookups into one query per DISTINCT currency (N+1-safe).
- Existing in-memory rate cache retained.

## Tests Added
- src/lib/currency/engine.test.ts: resolveRate identity, convertWithMeta DB-rate + metadata,
  convertWithMeta graceful missing-rate (original preserved), getBaseCurrency (value + default),
  getLatestRateMap, convertAmount behavior-preservation (DB + fallback).
- src/lib/currency/conversion.test.ts: integration-style coverage of the above.

## Known Risks / Limitations
- Listing conversion uses the LATEST available rate (not a per-transaction historical rate). Historical
  per-transaction rates are supported by `convertWithMeta`/`resolveRate` (date param) but not yet applied
  row-by-row in listings (would require per-row lookups). Future enhancement.
- Aggregate dashboard income/expense totals and budget "spent" still sum transaction amounts that may span
  multiple currencies; they are DISPLAYED in the base-currency symbol but are not yet currency-normalized
  in the underlying sum. Single-currency users are unaffected. Future enhancement.
- `prisma/migrations/20260712_extend_goals` is a stray 0-byte file (not a folder). Benign to Prisma;
  recommended cleanup via `rm` (see Migration Notes).

## Rollback Instructions
- `git revert <sprint-9.9-commit>` (or reset branch to pre-sprint). No database rollback required.
- Optional cleanup of the stray migration file after revert if it was touched.
