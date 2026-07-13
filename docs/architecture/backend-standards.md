# 16, 47, 48. Backend, Error Handling & Logging Standards

This document establishes the backend code patterns, standardized error structures, and telemetry logging policies.

## Error Handling Philosophy
1. **Never Throw Uncaught Exceptions**: All execution branches that access external APIs, database operations, or file parsers must execute within `try-catch` blocks.
2. **Explicit Error Categorization**: Catch blocks must wrap and translate low-level library errors into clear, domain-specific objects.
3. **Structured Error Hierarchy**:
   - `DomainError`: Base error representing business invariant failures.
   - `ValidationError`: Input schemas match errors.
   - `SecurityError`: Access control violations.
   - `SystemError`: Caching layer, database connection, or LLM API timeouts.

## Logging & Telemetry Protocols
- **Structured Logs**: Write logs to stdout as parsable JSON rather than raw text.
- **Log Levels**:
  - `INFO`: Standard lifecycle updates (e.g. server booted, migration verified, job completed).
  - `WARN`: Recoverable network failures or warning alerts (e.g., fallback exchange rates activated, circuit breaker tripped).
  - `ERROR`: System faults requiring immediate attention (e.g. database down, token parsing exceptions).
- **Tracer Correlation**: Every log written during a request lifecycle must include a correlation context metadata block containing:
  - `traceId`: Generated unique ID matching the web transaction.
  - `userId`: Identifier of the authenticated request initiator.
- **PII Scrubbing**: Never log unencrypted bank card credentials, emails, or passport documents. Implement PII sanitization filters.

## Logging & Error Code Examples

### Correct Error Handling and Logging
```typescript
import { prisma } from "../prisma";

export async function fetchUserAccounts(userId: string) {
  try {
    return await prisma.account.findMany({
      where: { userId },
    });
  } catch (err) {
    console.error(JSON.stringify({
      level: "ERROR",
      message: "Failed to fetch user accounts",
      userId,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    }));
    throw new Error("ACCOUNTS_FETCH_FAILED");
  }
}
```

### Incorrect Error Handling (Anti-pattern)
```typescript
// Anti-pattern: Console.log without structure, swallows error stack, does not bubble safely
export async function getAccounts(userId) {
  try {
    return await prisma.account.findMany({ where: { userId } });
  } catch (err) {
    console.log("error happened: " + err);
  }
}
```

## Backend Checklist
- [ ] No raw console.log statements remain in production files.
- [ ] Catch blocks log complete error parameters safely.
- [ ] PII attributes are cleaned before printing output messages.
- [ ] Business algorithms do not swallow error parameters silently.
- [ ] Error messages are mapped to readable code constants.
