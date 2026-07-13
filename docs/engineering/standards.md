# 07. Engineering Standards

This document defines core engineering rules, code style guidelines, naming conventions, naming rules, and directory structures.

## Core Paradigms
- **SOLID**:
  - *Single Responsibility*: A file must have exactly one reason to change. Separate business math from React hooks.
  - *Open/Closed*: Classes/modules must be open for extension but closed for modification.
  - *Liskov Substitution*: Subtypes must be substitutable for their base types.
  - *Interface Segregation*: Prefer small, cohesive interfaces over bloated structures.
  - *Dependency Inversion*: Depend on abstractions, not on concrete classes.
- **DRY (Don't Repeat Yourself)**: Avoid duplicated logic. If a currency conversion or date formatter is used in multiple components, extract it to a shared helper.
- **KISS (Keep It Simple, Stupid)**: Write simple, readable code. Avoid premature optimization or unnecessary abstraction layers.
- **YAGNI (You Aren't Gonna Need It)**: Do not implement features or code blocks that are not requested in the current sprint.

## Naming Conventions
- **Files & Directories**:
  - Use `kebab-case` for folder names (e.g. `event-bus`, `command-center`).
  - Next.js route groups use parenthesis `(app)`, `(auth)`.
  - Next.js dynamic parameters use brackets `[id]`.
- **Classes, Interfaces & Types**:
  - Class names must use `PascalCase` (e.g. `WorkflowEngine`).
  - Interface names must use `PascalCase` (e.g. `ResolvedRate`). Do NOT prefix interfaces with `I`.
  - Type names must use `PascalCase` (e.g. `RateSource`).
- **Variables, Functions & Properties**:
  - Use `camelCase` for variable and function names (e.g. `convertWithMeta`, `recentView`).
  - Constants must use `UPPER_SNAKE_CASE` (e.g. `FALLBACK_RATES`, `MAX_RETRIES`).

## Code Style Guide
- **Strict TypeScript**:
  - Set `"strict": true` in `tsconfig.json`.
  - No `any` type allowed. If a type is unknown, use `unknown`.
  - Prefer interfaces over type aliases for objects.
- **Imports Order**:
  1. React and framework core libraries (e.g., `next/link`, `react`).
  2. Third-party packages (e.g., `zod`, `@prisma/client`).
  3. Path-aliased modules (`@/lib/*`, `@/components/*`).
  4. Relative modules (`../prisma`, `./engine`).

## Formatting Rules
- Use 2 spaces for indentation.
- End files with a single trailing newline.
- Keep file sizes under 400 lines wherever possible. Extract modules when they exceed this.

## Code Style Examples

### Correct Style
```typescript
interface UserProfile {
  userId: string;
  currency: string;
}

export async function getBaseCurrency(
  userId: string,
  db = prisma
): Promise<string> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { currency: true },
  });
  return profile?.currency ?? "USD";
}
```

### Incorrect Style
```typescript
// Anti-pattern: Implicit any, no type safety, duplicated logic
export async function getCurr(userId) {
  let p = await prisma.profile.findUnique({ where: { userId } });
  return p ? p.currency : "USD";
}
```
