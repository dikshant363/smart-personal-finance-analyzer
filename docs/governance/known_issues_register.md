# Platform Registries: Issues, Debt, Risk & Roadmap

## 1. Known Issues Register
- **Issue #001**: Telemetry sync with external rates can timeout if target endpoint fails. Mitigated by cached fallbacks.
- **Issue #002**: Local browser offline sync may fail if storage quota is exceeded.

## 2. Technical Debt Register
- **Debt #001**: API schema models are defined redundantly in Prisma and Zod validators. Refactoring to unified types is planned.
- **Debt #002**: AI Orchestrator mocks external provider. Move to plug-in adapter layers.

## 3. Risk Register
- **Risk #001**: Third-party plugins might access browser localstorage. Mitigation: Sandbox execution isolation.
- **Risk #002**: Rates API latency. Mitigation: Edge caching.

## 4. Roadmap Register
- **Roadmap 1**: Multi-currency auto-conversion in transaction listings.
- **Roadmap 2**: Real-time advisor video session embeds.
