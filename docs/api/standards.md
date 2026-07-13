# 15. API Design Standards

This document establishes the guidelines, formatting patterns, rate-limiting, and error envelope schemas for the HTTP REST APIs of the Smart Personal Finance Analyzer.

## Core API Design Rules
1. **REST Resource Routing**: Route paths must use noun identifiers in kebab-case (e.g., `/api/exchange/import/preview`, `/api/family/splits`).
2. **Standard HTTP Methods**:
   - `GET`: Fetch resources. Safe and idempotent (must never modify data).
   - `POST`: Create resource records or execute transactional events.
   - `PUT`: Update records fully.
   - `DELETE`: Remove records.
3. **Structured JSON Envelopes**: All API endpoints must return structured JSON objects containing standard payload formats:
   - Success: `{ "ok": true, "data": ... }`
   - Failure: `{ "ok": false, "error": { "message": "Reason for failure", "code": "ERROR_CODE" } }`

## Input Validation (Zod Guardrails)
- Every API endpoint that parses body elements, route dynamic parameters, or query parameters must execute a `zod` schema check.
- When validation fails, return HTTP `400 Bad Request` with structured field messages instead of throwing a server crash.

## Security & Access Control
- **Authentication**: Require session token authentication on all protected endpoints using custom authorization middleware.
- **IDOR Safeguards**: Check that the request's authenticated user ID matches the owner ID of the queried database record before returning resources.
- **Rate Limiting**: Protected actions (such as sending alerts, uploading documents, or executing AI predictions) must enforce rate limiting. Use token buckets or time-interval checking keys.

## API Pattern Code Examples

### Correct API Route Handler
```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  type: z.enum(["Income", "Expense"]),
  date: z.string().datetime(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createTransactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: { message: "Validation failed", details: result.error.format() } },
        { status: 400 }
      );
    }
    
    // Process creation...
    return NextResponse.json({ ok: true, data: { id: "tx-123" } });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
```

### Incorrect API Route Handler (Vulnerable)
```typescript
// Anti-pattern: No validation, string input parsed directly, missing try/catch
export async function POST(req: Request) {
  const body = await req.json();
  const tx = await prisma.transaction.create({ data: body });
  return Response.json(tx);
}
```

## API Validation Checklist
- [ ] Zod schema handles body validation.
- [ ] Session authentication check executes first.
- [ ] Returns structured success/failure envelopes.
- [ ] Custom validation checks prevent parameter tampering/IDOR.
- [ ] HTTP status codes align with REST conventions (e.g. 200, 201, 400, 401, 403, 404, 500).
