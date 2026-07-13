# 18. DevOps & Observability Standards

This document describes the container configuration rules, CI/CD pipeline structures, environment secrets management, and platform observability metrics.

## CI/CD Pipeline Design
- **Verification Gates**: The pipeline must validate the codebase by executing the quality check commands on every pull request target branch:
  1. `npm install` — Package dependency resolution.
  2. `npm run lint` — Lint checking.
  3. `npm run typecheck` — TypeScript compilation verification.
  4. `npm test` — Core unit and integration test assertions execution.
  5. `npm run test:e2e` — Headless browser integration tests execution.
  6. `npm run build` — Production target compilation verification.
- **Fail-Fast**: The build pipeline must abort execution immediately if any step reports a non-zero exit status.

## Configuration & Environment Secrets Management
1. **Zero Hardcoded Secrets**: Under no circumstances should API keys, database connection strings, JWT signing secrets, or provider tokens exist inside the repository files.
2. **Environment Variables (.env)**: Configuration values must resolve at runtime using `process.env`.
3. **Template Registry**: Document every required environment key inside `.env.example` with dummy values.
4. **Secret Storage**: Production secrets must resolve dynamically using cloud provider vaults or encrypted container deployment variables.

## Observability & Performance Monitoring (SRE)
- **Active Diagnostics Endpoint**: Expose `/api/health` returning `{ "ok": true }` to allow heartbeat checks by ingress proxies or deployment balancers.
- **Circuit Breaker Policies (SRF)**: Integrate dynamic state monitors for external network requests. Trips state configurations to "Open" when target queries fail frequently, executing cached fallbacks immediately to preserve application availability.
- **Latencies Tracking**: Log duration parameters on core analytical mutations to track transaction process boundaries.

## Secrets and Config Verification Example

### Correct Configuration Usage
```typescript
export function getOAuthClientId(): string {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing required environment configuration: OAUTH_CLIENT_ID");
  }
  return clientId;
}
```

### Incorrect Configuration Usage (Anti-pattern)
```typescript
// Anti-pattern: Hardcoded client credentials in source file, security vulnerability
export function getClientId() {
  return "12345-client-id-abcde.apps.googleusercontent.com";
}
```

## DevOps Checklist
- [ ] Environment secrets are declared strictly in `.env.example` templates.
- [ ] No credential parameters are tracked inside Git index files.
- [ ] Active `/api/health` diagnostics check endpoint compiles successfully.
- [ ] Circuit breaker threshold flags are configured inside external connectors.
- [ ] Integration validation commands are registered inside the CI execution pipeline.
