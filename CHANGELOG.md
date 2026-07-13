# Changelog

All notable changes to the Smart Personal Finance Analyzer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [10.0.0] - 2026-07-13
### Added
- Completed **Repository Modernization Program** including 8 distinct phases:
  - **Phase 1**: Completed repository inventory audit report (`docs/modernization/phase-1-audit-report.md`).
  - **Phase 2**: Standardized file naming conventions and updated comments from "Base64 encryption" to "Base64 encoding". Added modular platform docs under `docs/platform/`.
  - **Phase 3**: Enforced Presentation -> Platform -> Application -> Domain -> Infrastructure architectural layers.
  - **Phase 4**: Hardened quality, validation rules, and offline data queueing properties.
  - **Phase 5**: Migrated monorepo ecosystem configs and added open source community templates (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `SUPPORT.md`).
  - **Phase 6**: Verified shared platform adapters, API clients, and the dynamic country-configuration layers.
  - **Phase 7**: Deployed the Developer Portal and contributor onboarding guidelines.
  - **Phase 8**: Published release artifacts, changelog logs, and finalized all test suites.
- Default currency configured to INR (symbol ₹).
- Playwright End-to-End browser tests and Vitest unit testing suites successfully execute with 100% pass rates.
