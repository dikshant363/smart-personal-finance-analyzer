# 20, 21, 22, 23, 24, 25, 26, 27, 28. Release & Git Governance

This document describes the versioning policies, branch strategies, code review rules, release processes, and rollback strategies.

## Git Branch Strategy
- **Master Branches**:
  - `main` / `master`: Contains production-ready code. Every commit on main must represent a stable build state.
- **Feature Branches**:
  - Developers must work inside feature-specific branches branching from main.
  - Branch naming convention: `feature/sprint-<phase>.<sprint>-<short-description>` (e.g. `feature/sprint-9.9-multi-currency`).
- **Release Tagging**:
  - Sprints must be tagged using Semantic Versioning (`v<major>.<minor>.<patch>`) (e.g. `v9.9.0`).
  - Tags must be annotated and contain release notes.

## Commit Message Policy (Conventional Commits)
Format: `<type>(<scope>): <short description>`
- **Types**:
  - `feat`: A new feature implementation.
  - `fix`: A bug fix or compiler resolution.
  - `test`: Adding or refactoring test specifications.
  - `docs`: Updating handbook documents, runbooks, or markdown files.
  - `refactor`: Structural codebase improvements without changing functionality.
- **Example**: `feat(currency): implement auto-conversion displaying base currency values`

## Sprint Workflow & Quality Gates
1. **Sprint Kickoff**: Set target goals and create the `feature/sprint-X` branch.
2. **Execution**: Write unit tests, implement functionality, and update documentation.
3. **Quality Gates Verification**:
   - `npm install` — Clean resolution of all third-party dependencies.
   - `npm run lint` — Zero code formatting errors.
   - `npm run typecheck` — Clean typescript compile execution.
   - `npm test` — Core test suite assertions execute successfully.
   - `npm run test:e2e` — Playwright integration tests pass.
   - `npm run build` — Compilation target executes without warning flags.
4. **Pull Request & Code Review**:
   - Review architectural compliance, test coverage, validation schema structures, IDOR security flags, and code cleanliness.
   - PR must only merge when all automated quality gates report success.
5. **Tagging & Changelog**: Update `CHANGELOG.md` and create the release tag (e.g. `v9.9.0`).

## Rollback Policy
- **Minor Outages**: Revert the commit on main, or deploy a corrective fix branch immediately.
- **Critical Failure**: Roll back the production container target to the previous stable release tag (e.g. `v9.8.0`).
- **Database Rollback**: If a database schema modification causes errors, roll back using migration scripts and run `npx prisma migrate resolve` or restore the previous db snapshot backup.
