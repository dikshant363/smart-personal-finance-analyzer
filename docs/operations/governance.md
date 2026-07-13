# 29, 30, 31, 40. Operations, Performance & Production Readiness

This document defines performance thresholds, vertical scaling strategies, database querying standards, telemetry rules, and production deployment checklists.

## Performance Thresholds (SRE)
1. **API Response Latencies**:
   - 95% of standard read API endpoints must respond under **150ms**.
   - 99% of read endpoints must respond under **300ms**.
   - Computational analytics endpoints (e.g. Monte Carlo) must respond under **1.2s**.
2. **First Load JS Bundle Size**: First load shared JS must remain under **100 kB** to avoid blocking mobile page renderings.
3. **Database Queries**: Optimize queries to prevent N+1 issues by joining relations inside a single query or batching IDs.

## Scalability & Cache Management
- **In-Memory Caching (SRF)**:
  - Cache database calculations that rarely change (like exchange rates) inside in-memory buffers using key structures (e.g. `FROM_TO_DATEString`).
  - Cache entries must declare strict Time-To-Live (TTL) policies and be purgeable at any time using clear handlers (`clearRatesCache()`).
- **Database Scaling**: Direct analytical operations to read-only transaction arrays or utilize database replicas.

## Production Readiness Checklist
- [ ] Database migrations deployed successfully (`npx prisma migrate deploy`).
- [ ] Connection strings and API credentials resolved strictly from runtime variables.
- [ ] Production build compiled with zero compiler errors.
- [ ] Server health check endpoint `/api/health` registers `ok: true`.
- [ ] Production cache layers have clear invalidation and eviction triggers.
- [ ] Error alert loggers are set up with notifications for SRE teams.
- [ ] Rate limits are active on all transaction, payment, and AI endpoints.
- [ ] GDPR portabilities (JSON exporters) are active and tested.
