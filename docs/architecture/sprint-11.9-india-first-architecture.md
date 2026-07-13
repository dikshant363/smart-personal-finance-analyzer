# Sprint 11.9 — India-First Platform Architecture
# Architecture Documentation

## Overview

Sprint 11.9 integrates the **India-First Project Constitution & Architecture Directive**. It introduces a strongly-typed Country Configuration layer to govern currency defaultings, localized date/number formatting, banking products, investment rules, and AI copilot prioritization models while leaving the core platform fully extensible to alternate packs.

---

## 1. Country Configuration Layer (`@finance/shared-config`)

The configuration layer abstracts all regional differences out of the business domain code:
- **Default Country**: India (IN)
- **Currency default**: Indian Rupee (`INR`, `₹`)
- **Locale standard**: `en-IN` (English-India)
- **Number format**: Indian Numbering System (Lakh and Crore groupings: e.g. `₹1,00,000.00` instead of `₹100,000.00`).
- **Financial Year boundaries**: April 1st to March 31st.
- **Local Payment Systems**: UPI, QR, IMPS, NEFT, RTGS.
- **Local Investment Products**: PPF, EPF, NPS, SSY, NSC, SCSS, Fixed Deposits, Recurring Deposits, Mutual Fund SIPs.

```typescript
export interface CountryConfig {
  countryCode: string;
  countryName: string;
  currency: { code: string; symbol: string; name: string };
  localization: {
    defaultLocale: string;
    defaultTimezone: string;
    defaultDateFormat: string;
    supportedLanguages: Array<{ code: string; name: string }>;
  };
  financialYear: { startMonth: number; startDay: number; endMonth: number; endDay: number };
  paymentSystems: string[];
  investmentProducts: string[];
  taxSettings: { taxYearType: "Financial" | "Calendar"; identifierTypes: string[]; filingDocuments: string[] };
}
```

---

## 2. Integrated Code Points

### Unified Formatters
- **`shared-models/index.ts`**: formats currencies referencing active locale (`en-IN`) and currency code (`INR`).
- **`finance-app/src/lib/currency/engine.ts`**: `formatMoney` automatically defaults to the config's Indian currency code (`INR`) and formatting locales.
- **`finance-app/src/lib/localization/engine.ts`**: default locale mapping switches to `en-IN`.

### AI Copilot Prioritizations (`finance-app/src/lib/copilot/engine.ts`)
The AI Copilot has been adjusted to prioritize Indian financial systems:
- Recommends systematic investment plans (SIPs) and tax deductions (PPF, EPF under Section 80C) before foreign equivalents.
- Prioritizes UPI transactional guidelines and limits configurations.

### Multi-Platform Clients Defaults
- **Android Kotlin viewmodels**: default mock transactions use `INR` currencies. Jetpack Compose views render Rupee `₹` prefixes.
- **iOS SwiftUI views**: currency formatters default to `INR` and fallbacks return `₹` symbols.

---

## 3. Git Branch and Versioning
- **Branch**: `feature/sprint-11.9-india-first`
- **Release tag**: `v2.1.0-india`
