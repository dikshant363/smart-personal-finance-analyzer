# 34, 35, 41, 42, 43. Contributor Guidelines & Responsibilities

This document defines user responsibilities, AI developer guidelines, contribution rules, and expansion standards.

## User Responsibilities
To ensure smooth sprint planning, the user must provide the following before initiating any new feature implementation:
1. **Repository Context**: Access to the active codebase and Prisma schemas.
2. **Environment Specs**: Active database configuration, environment template keys, framework versions, and Node versions.
3. **Execution Environment**: A terminal runtime context enabling compilation, database migrations, and pipeline verification tests.

## AI Developer Responsibilities
When pair programming or building features, the AI must strictly follow these rules:
1. **Read Existing Code**: Inspect files before creating new ones or rewriting modules. Reuse existing components, hooks, and helpers.
2. **Enforce Quality Gates**: Run the full validation pipeline (lint, typecheck, tests, build) on every task completion.
3. **Refuse Incomplete Work**: Never declare a sprint complete if tests are failing, types are broken, or features are partially mocked.
4. **Honest Reporting**: Report build failures, compiler errors, and limitations clearly. Do not fabricate validation results.

## Future Expansion & Code Contribution Rules
- **No Scope Creep**: Implement only the requested feature. Do not guess future abstractions or add extra properties.
- **Maintain Backward Compatibility**: Do not change public API schemas or model configurations unless a database migration and deprecation policy are scheduled.
- **Document Code Revisions**: Update the index document index, `CHANGELOG.md`, and relevant sprint guides.
- **Review Guidelines**: Every pull request must satisfy all criteria in the validation checklists before merge clearance.
