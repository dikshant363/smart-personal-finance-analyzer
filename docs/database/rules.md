# 14. Database Rules & Migrations

This document specifies the database design rules, referential integrity guidelines, indexing practices, and migration protocols for the Smart Personal Finance Analyzer.

## Database Schema Design Rules
1. **Prisma as Single Source of Truth**: All schema additions, column alterations, or relations must be defined inside `prisma/schema.prisma`.
2. **Strict Foreign Key Constraints**: Every relation must declare explicit referential constraints (`onDelete: Cascade` or `onDelete: Restrict`) to prevent orphaned rows.
3. **Decimals for Financial Precision**: Money amounts, interest values, and exchange rates must be mapped to `Decimal` types (never use JavaScript floats which introduce floating-point errors).
4. **Timestamps on All Tables**: Every model must define `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` for auditable tracing.

## Indexing & Performance Policies
- **Core Query Columns**: Create indexes on columns frequently used inside `where` or `orderBy` clauses (e.g. `userId` in `Transaction`, `date` in `ExchangeRate`).
- **Unique Constraints**: Unique fields must be enforced using Prisma `@unique` blocks to prevent database level duplicates (e.g. `userId` in `Profile`).
- **Avoid Over-Indexing**: Limit indexes to 4-5 per table to avoid slowing down insert and update queries.

## Migration Protocols & Rollback Safety
- **Local-Only Migrations**: Run `npx prisma migrate dev` locally to test model adjustments and create migration scripts.
- **Production Migrations**: Execute `npx prisma migrate deploy` inside CI/CD processes. Never run `npx prisma db push` on staging or production systems.
- **Stray Cleanup**: Benign, empty migration directories or stray files must be deleted using `rm` to prevent directory pollution.
- **Rollback Planning**: Every database change that requires structural updates must include rollback guidelines:
  - Add column additions as optional (`?`) columns first.
  - Populate them via transaction backfills.
  - Make them required in a subsequent release. This maintains backward compatibility and avoids downtime.

## Database Pattern Code Examples

### Correct Schema Definition
```prisma
model Transaction {
  id           String        @id @default(uuid())
  userId       String
  amount       Decimal       @db.Decimal(12, 2)
  currency     String        @default("USD")
  type         String        // "Income" | "Expense"
  date         DateTime
  categoryId   String?
  category     Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([userId])
  @@index([date])
}
```

### Incorrect Schema Definition
```prisma
// Anti-pattern: Float values for money, missing indices, missing timestamps
model BadTransaction {
  id      String @id
  userId  String
  amount  Float
}
```

## Database Checklist
- [ ] Money columns use Decimal type.
- [ ] Timestamps `createdAt` and `updatedAt` are declared on the model.
- [ ] Foreign keys have matching referential indices.
- [ ] Cascade policies are declared on all relations.
- [ ] Migrations are generated via Prisma Client and verified.
