# Open Source Developer Portal & Contributor Onboarding Guide
# Developer Portal

Welcome to the Smart Personal Finance Analyzer contributor ecosystem. This portal provides architectural blueprints, extension patterns, and configuration structures to assist developers in building and extending the platform.

---

## 1. Quick Start
To run the platform locally:
```bash
# Clone the repository
git clone https://github.com/open-finance/smart-personal-finance-analyzer.git
cd smart-personal-finance-analyzer

# Install dependencies
npm install

# Generate local prisma schemas
npx prisma generate

# Build and run the Next.js development server
npm run dev
```

---

## 2. Monorepo Architecture Overview
The repository follows a clean layered structure organized across packages and client shells:
- **`packages/shared-config/`**: Holds configuration packs (Defaults to `INDPack`).
- **`packages/shared-models/`**: Shared mathematical operations (Net Worth, Goals calculations).
- **`packages/api-sdk/`**: Platform-neutral client interfaces consuming Next.js REST endpoints.
- **`packages/sync-sdk/`**: Action queue management for handling offline operations.

---

## 3. Extension Framework
The core platform allows extensions across several key boundaries without modifying core business rules:

### A. Country Packs
To implement a custom Country Pack (e.g. US or UK pack), developers must implement the `CountryConfig` contract interface:
```typescript
import { CountryConfig } from "@finance/shared-config";

export const USPack: CountryConfig = {
  countryCode: "US",
  countryName: "United States",
  currency: { code: "USD", symbol: "$", name: "US Dollar" },
  financialYear: { startMonth: 0, startDay: 1, endMonth: 11, endDay: 31 }, // Calendar Year
  // ...
};
```

### B. AI Copilot Providers
To register a new AI model provider, implement the `MockGeminiProvider` or target LLM client contract.
