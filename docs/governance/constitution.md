# 50. Project Constitution Governance

This document serves as the final, binding Engineering Constitution of the Smart Personal Finance Analyzer project.

## Constitution Scope & Applicability
This constitution governs:
1. Every software engineer, architect, SRE, and product manager working on this codebase.
2. Every AI assistant, coding agent, or autonomous builder tasked with generating, reviewing, or refactoring the code.
3. Every repository branch, database migration, API route, and deployment package.

## Core Mandates
- **Quality Gates First**: The build, lint, unit test, and E2E test validation pipeline must compile and pass cleanly on every branch release.
- **Zero Mocked Production Code**: All production endpoints must execute actual business algorithms. Mocking is restricted strictly to unit/integration test scopes.
- **Strict Typing & Abstraction**: No `any` type is allowed inside source files. No direct raw queries bypassing Prisma or parameterization are permitted.
- **Data Protection**: Personal Identifiable Information (PII) must be masked inside application logs. Users must be provided with complete GDPR data export options.

## Amendment & Evolution Policy
To modify this constitution or update any engineering guidelines:
1. Create a design proposal or an Architecture Decision Record (ADR) file.
2. Review the proposal against the project vision, security compliance, and backward compatibility.
3. Once approved, merge the change into the main index document [00-project-constitution.md](file:///Users/dikshantagarwal/Documents/Smart%20Personal%20Finance%20Analyzer/docs/00-project-constitution.md) and update the corresponding subdirectories inside the `docs/` tree.

---

### Constitutional Signatures
By developing on, reviewing, or deploying this codebase, all human developers and AI assistants pledge to uphold the principles, rules, security guardrails, and coding guidelines established in this Project Constitution.

*Signed,*
**The Engineering Organization**
*Smart Personal Finance Analyzer*
