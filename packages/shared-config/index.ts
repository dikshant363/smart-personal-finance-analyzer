/**
 * Country Configuration Layer — Package: @finance/shared-config
 * Defines the schema and configurations for localization and country-specific rules.
 */

export interface CountryConfig {
  countryCode: string; // e.g. "IN"
  countryName: string; // e.g. "India"
  currency: {
    code: string; // e.g. "INR"
    symbol: string; // e.g. "₹"
    name: string;
  };
  localization: {
    defaultLocale: string; // e.g. "en-IN"
    defaultTimezone: string; // e.g. "Asia/Kolkata"
    defaultDateFormat: string; // e.g. "DD/MM/YYYY"
    supportedLanguages: Array<{ code: string; name: string }>;
  };
  financialYear: {
    startMonth: number; // 1-based, e.g. 4 for April
    startDay: number; // e.g. 1
    endMonth: number; // e.g. 3 for March
    endDay: number; // e.g. 31
  };
  paymentSystems: string[];
  investmentProducts: string[];
  bankingConventions: {
    accountFormats: string[];
    aggregatorsSupported: boolean;
  };
  taxSettings: {
    taxYearType: "Financial" | "Calendar";
    identifierTypes: string[]; // e.g. ["PAN", "Aadhaar"]
    filingDocuments: string[]; // e.g. ["Form 16", "AIS", "TIS"]
  };
  insuranceCategories: string[];
  regulatoryBodies: string[];
}

export const INDPack: CountryConfig = {
  countryCode: "IN",
  countryName: "India",
  currency: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  },
  localization: {
    defaultLocale: "en-IN",
    defaultTimezone: "Asia/Kolkata",
    defaultDateFormat: "DD/MM/YYYY",
    supportedLanguages: [
      { code: "en-IN", name: "English (India)" },
      { code: "hi", name: "Hindi" },
      { code: "gu", name: "Gujarati" },
      { code: "mr", name: "Marathi" },
      { code: "ta", name: "Tamil" },
      { code: "te", name: "Telugu" },
      { code: "kn", name: "Kannada" },
      { code: "ml", name: "Malayalam" },
      { code: "pa", name: "Punjabi" },
      { code: "bn", name: "Bengali" },
      { code: "or", name: "Odia" },
      { code: "as", name: "Assamese" },
      { code: "ur", name: "Urdu" },
    ],
  },
  financialYear: {
    startMonth: 4, // April
    startDay: 1,
    endMonth: 3, // March
    endDay: 31,
  },
  paymentSystems: [
    "UPI",
    "QR payments",
    "IMPS",
    "NEFT",
    "RTGS",
    "Debit Cards",
    "Credit Cards",
    "Net Banking",
    "Wallets",
  ],
  investmentProducts: [
    "UPI",
    "Bank Accounts",
    "Fixed Deposits",
    "Recurring Deposits",
    "Public Provident Fund (PPF)",
    "Employees' Provident Fund (EPF)",
    "National Pension System (NPS)",
    "Sukanya Samriddhi Yojana (SSY)",
    "National Savings Certificate (NSC)",
    "Senior Citizens Savings Scheme (SCSS)",
    "Sovereign Gold Bonds",
    "Digital Gold",
    "Mutual Funds",
    "Equity",
    "ETFs",
    "Government Securities",
    "Corporate Bonds",
    "SIP",
    "SWP",
    "STP",
  ],
  bankingConventions: {
    accountFormats: ["IFSC", "Account Number"],
    aggregatorsSupported: true,
  },
  taxSettings: {
    taxYearType: "Financial",
    identifierTypes: ["PAN", "Aadhaar"],
    filingDocuments: ["Form 16", "AIS", "TIS", "Form 26AS", "Capital Gains Certificate"],
  },
  insuranceCategories: [
    "Health Insurance",
    "Life Insurance",
    "Term Insurance",
    "Motor Insurance",
    "Personal Accident",
    "Home Insurance",
    "Travel Insurance",
  ],
  regulatoryBodies: ["RBI", "SEBI", "IRDAI", "PFRDA", "Income Tax Department"],
};

const countryPacks: Record<string, CountryConfig> = {
  IN: INDPack,
};

/**
 * Returns the currently active country configuration.
 * By default, this is the India Pack.
 */
export function getActiveConfig(): CountryConfig {
  // Configured to default to India (IN) and only INDPack is enabled.
  return countryPacks["IN"];
}
