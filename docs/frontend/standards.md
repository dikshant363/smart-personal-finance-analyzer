# 08, 09, 10, 17. UI/UX, Accessibility & Frontend Standards

This document establishes UI styles, UX guidelines, accessibility rules, and Next.js frontend patterns.

## UI Styling System
- **Core Technology**: Use TailwindCSS utility tokens configured in `tailwind.config.ts`.
- **Aesthetic Principles**:
  - Premium, modern, dark-mode/glassmorphism design.
  - Curated, harmonic color palettes. Avoid primary saturated red, blue, green. Use tailwind palettes like `indigo-600`, `emerald-500`, `rose-500` with subtle transparency overlays.
  - Interactive components must feature hover transitions (`transition-all duration-200 ease-in-out`).

## UX Best Practices
- **Response Latency**: Interactive controls must provide instant visual feedback. Use loading states or disabled buttons during network requests.
- **Empty States**: Every table, list, or panel must provide a friendly illustration or call to action when no data is returned.
- **Form Validation**: Validate inputs client-side using native validity states, and enforce server-side validation using Zod schemas.

## Accessibility Standards (WCAG 2.2 AA)
- **Semantic HTML**: Use correct elements (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`).
- **Focus Management**:
  - Focus outlines must be clearly visible and customized (`focus-visible:ring-2 focus-visible:ring-brand-500`).
  - Modal dialogues must trap focus and return focus to the trigger element when closed.
- **ARIA Attributes**:
  - Provide `aria-label` or `aria-labelledby` for icon-only buttons.
  - Interactive widgets (accordions, tabs) must feature appropriate `aria-expanded` and `role` properties.
- **Contrast**: Text elements must meet a minimum contrast ratio of 4.5:1 against their background (3:1 for large text).
- **Keyboard Navigation**:
  - All interactive elements must be tab-navigable (`tabindex="0"`).
  - Pressing `Enter` or `Space` on focused controls must trigger their click action.

## Frontend Engineering Rules
- **Component Isolation**: Separate presentation UI files from business logic calculators. Put core components in `src/components/` and routing handlers in `src/app/`.
- **Server Components**: Prefer Next.js React Server Components (RSC) for data fetching to minimize client-side bundle size.
- **Client Components**: Restrict client components to files that require browser hooks (`useState`, `useEffect`, `useRouter`) by adding `"use client"` at the top.

## Accessibility Implementation Example

### Correct WCAG AA Component
```tsx
import { useState } from "react";

export function AccessibleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
      aria-label={label}
    >
      {label}
    </button>
  );
}
```

### Incorrect Component (Violates WCAG)
```tsx
// Anti-pattern: No focus indicator, hard-coded non-semantic element, no keyboard support
export function BadButton({ label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-blue text-white p-2"
    >
      {label}
    </div>
  );
}
```
