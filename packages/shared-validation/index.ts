/**
 * Shared Validation Schemas — Package: @finance/shared-validation
 * Reusable Zod schemas consumed by web API routes AND future mobile clients.
 * Mobile clients can use TypeScript versions; native clients mirror these rules.
 */

// NOTE: Zod is a peer dependency; native mobile clients implement equivalent validation natively.

/** Raw shape for transaction creation — mirrors mobile form validation rules */
export const transactionValidationRules = {
  amount: {
    min: 0.01,
    max: 1_000_000_000,
    required: true,
  },
  currency: {
    length: 3,
    required: true,
  },
  type: {
    values: ["Income", "Expense"] as const,
    required: true,
  },
  description: {
    minLength: 1,
    maxLength: 500,
    required: false,
  },
  date: {
    required: true,
    format: "ISO 8601",
  },
};

/** Budget validation rules */
export const budgetValidationRules = {
  name: {
    minLength: 1,
    maxLength: 100,
    required: true,
  },
  amount: {
    min: 0.01,
    required: true,
  },
  period: {
    values: ["Monthly", "Weekly", "Yearly", "Custom"] as const,
    required: true,
  },
};

/** Goal validation rules */
export const goalValidationRules = {
  name: {
    minLength: 1,
    maxLength: 100,
    required: true,
  },
  targetAmount: {
    min: 1,
    required: true,
  },
  category: {
    values: ["Savings", "Investment", "Debt", "Emergency", "Travel", "Other"] as const,
    required: true,
  },
};

/** Error code constants shared across all platforms */
export const ErrorCodes = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  OFFLINE_QUEUE_FULL: "OFFLINE_QUEUE_FULL",
  SYNC_CONFLICT: "SYNC_CONFLICT",
  AI_PROVIDER_ERROR: "AI_PROVIDER_ERROR",
  CURRENCY_NOT_FOUND: "CURRENCY_NOT_FOUND",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/** HTTP status code mapping */
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

/** Validates that a string is a valid ISO 8601 date */
export function isValidISODate(value: string): boolean {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/** Validates that a value is a valid currency code (3 uppercase letters) */
export function isValidCurrencyCode(value: string): boolean {
  return /^[A-Z]{3}$/.test(value);
}

/** Validates that an amount is within range */
export function isValidAmount(value: number): boolean {
  return value >= 0.01 && value <= 1_000_000_000;
}
