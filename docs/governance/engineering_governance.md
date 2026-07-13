# Engineering Governance Policy

## 1. Coding Standards
- **Language**: TypeScript must be configured with `strict: true`.
- **Formatting**: Automated formatting via Prettier.
- **Linting**: ESLint configurations must be followed without bypass directives.

## 2. Definition of Done (DoD)
- [ ] Code compiles with 0 warnings or errors.
- [ ] Code coverage threshold of 90% is maintained.
- [ ] Linting checks compile successfully.
- [ ] All unit, integration, and E2E regression tests pass.
- [ ] Documentation guides are updated.

## 3. Dependency Management
- **Audit**: Weekly `npm audit` checks. Moderate/High severity vulnerabilities must be patched immediately.
- **Lockfile**: All changes to `package.json` must preserve lockfile consistency.
