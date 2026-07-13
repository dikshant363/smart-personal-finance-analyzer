# Extension & Plugin Governance Policy

## 1. Extension Review Guidelines
- **Verification**: Extensions must pass a static security scan before publication.
- **Data Isolation**: Extensions must never access the core database schema directly. Instead, they must interface through the SDK.

## 2. Permission Model
- **Principle of Least Privilege**: Extensions must declare all required scopes (e.g., `read:transactions`, `read:budgets`) inside their manifest.
- **Revocation**: Users can revoke granular permissions at any time via the Developer Console.

## 3. Security Review Checklist
- [ ] Manifest verifies correct SemVer compatibility.
- [ ] No remote code execution (eval, Function) exists.
- [ ] All network call targets match registered domains.
