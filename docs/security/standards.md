# 11, 12, 38. Security & Privacy Standards

This document describes the security policies, privacy controls, data protection rules, and security checklist for the Smart Personal Finance Analyzer.

## OWASP Top 10 Protections
1. **Broken Access Control**: Every endpoint must verify session token authentication and check authorization before fetching or mutating resource nodes (e.g., verifying `userId` matches the query record).
2. **Cryptographic Failures**: Sensible keys, user emails, and database connections must be encrypted. All external connections must enforce HTTPS.
3. **Injection**:
   - Enforce SQL Injection protection by executing queries strictly through Prisma Client parameterization (never string-interpolate parameters inside raw queries).
   - Sanitize AI prompt inputs using prompt validators to prevent prompt injection attempts.
4. **Insecure Design**: Follow the principle of least privilege. Implement strict authentication walls for core `/dashboard`, `/transactions`, and `/api/*` endpoints.
5. **Security Misconfiguration**: Enforce secure HTTP headers (e.g. CORS restrictions, Content Security Policy). Disable detailed error stack traces in production environments.
6. **Vulnerable and Outdated Components**: Periodically scan dependencies (`npm audit`) and update vulnerable third-party modules.
7. **Identification and Authentication Failures**: Enforce strong password guidelines during signup. User passwords must be hashed using `bcryptjs` with a minimum cost factor of 10.
8. **Software and Data Integrity Failures**: Verify integrity of inputs. Enforce Zod schemas on every API entry payload.
9. **Security Logging and Monitoring Failures**: Every authentication action, critical mutation, or execution error must be logged with correlation tracers to detect attacks.
10. **Server-Side Request Forgery (SSRF)**: Validate any user-supplied URLs before making outbound HTTP queries.

## Privacy & GDPR Compliance
- **Data Minimization**: Collect only the bare minimum fields necessary to execute the requested financial evaluations.
- **GDPR Data Portability**: Users have a legal right to export their complete financial profile. Expose a GDPR exporter (`src/lib/compliance/engine.ts`) to return all associated account, asset, liability, and profile tables in structured JSON format.
- **Right to Be Forgotten**: Provide simple delete options to completely purge a user profile and all transaction history from the database cleanly.
- **Log Sanitization & Data Masking**: Telemetry logs must never persist unencrypted Personal Identifiable Information (PII). Implement a PII scrubber matching regex patterns for emails, phone numbers, and bank account numbers before writing logs to stdout/telemetry.

## Security Code Style Examples

### Correct Style (Secure IDOR Check)
```typescript
export async function getTransaction(
  id: string,
  userId: string,
  db = prisma
) {
  const transaction = await db.transaction.findUnique({
    where: { id },
  });

  if (!transaction || transaction.userId !== userId) {
    throw new Error("Unauthorized access to transaction record.");
  }

  return transaction;
}
```

### Incorrect Style (Vulnerable to IDOR)
```typescript
// Anti-pattern: No owner validation, vulnerable to parameter tampering
export async function getTx(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
  });
}
```

## Security & Privacy Checklist
- [ ] Password hashes use bcrypt with salt strength >= 10.
- [ ] JWT tokens have an expiration period (e.g., 24h) and use secure HTTPS cookies.
- [ ] No raw queries interpolate string values (SQL injection check).
- [ ] Outbound integrations enforce circuit breakers and rate limit boundaries.
- [ ] PII data is masked in application logs before writing output.
- [ ] Exporter scripts collect and format all user tables to fulfill GDPR mandates.
- [ ] Outgoing HTTP responses set safety headers (CSP, X-Frame-Options).
- [ ] Sensitive API tokens are kept in `.env` and never checked into source control.
