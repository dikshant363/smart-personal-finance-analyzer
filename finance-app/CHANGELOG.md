# Changelog

All notable changes to the Smart Personal Finance Analyzer are documented here.
Versions follow Semantic Versioning (MAJOR.MINOR.PATCH).

## [9.9.0] - 2026-07-13

### Added
- Multi-Currency Auto-Conversion & Unified Currency Display (Sprint 9.9).
- Server-side currency conversion service reusing the existing `convertAmount` engine:
  `resolveRate`, `convertWithMeta`, `getBaseCurrency`, `getLatestRateMap`, and `withBaseCurrency`.
- Transaction listing (page + `/api/transactions` GET) now returns each transaction enriched with
  `amountBase`, `rate`, `converted`, and `baseCurrency` while preserving the original `amount`/`currency`.
- Unified base-currency display across transaction listings, dashboard recent transactions, goals
  aggregates, spending intelligence, recommendations, and analysis insights (previously hard-coded to USD).
- Graceful handling of missing exchange rates (original amount shown unchanged, never fabricated).

### Changed
- `analyzeSpending` now resolves the user's Profile currency and threads it through insight/alert text.
- Goals page aggregates totals into the user's base currency before display.

### Fixed
- Analysis insights, spending page, and recommendations page no longer hard-code "USD"; they use the
  user's selected base currency.

### Database
- No schema changes. No migration required.

### Migration Notes
- The directory `prisma/migrations/20260712_extend_goals` is a stray 0-byte file (not a valid migration
  folder). It is ignored by Prisma and does not affect `migrate deploy`. Recommended cleanup:
  `rm finance-app/prisma/migrations/20260712_extend_goals` (safe; the Goal extension already exists in
  prior migrations). If a no-op migration is preferred instead, add
  `prisma/migrations/20260712_extend_goals/migration.sql` with a comment-only body.

### Rollback
- Revert the Sprint 9.9 commit. No database rollback needed (no schema/migration changes).
