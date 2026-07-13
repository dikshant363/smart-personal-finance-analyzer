# API Governance Policy

## 1. API Versioning Policy
- **Versioning Scheme**: Semantic Versioning (SemVer) pattern. Public API paths must be structured as `/api/v[major]/[resource]`.
- **Backward Compatibility**: Patch and Minor version releases must guarantee zero breaking changes to existing endpoints.

## 2. Deprecation Policy
- **Grace Period**: Deprecated API elements will remain active for at least two minor version lifecycles.
- **Headers Warning**: Deprecated responses must return a `Warning: 299 - "Deprecated API"` HTTP header.

## 3. Breaking Change Process
- **Approvals**: Any breaking change requires approval from the Architecture Review Board.
- **Migration Guides**: Must be accompanied by a detailed step-by-step upgrade guide.
