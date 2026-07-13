import { getActiveConfig } from "@finance/shared-config";

export type SupportedLocale = "en-US" | "en-GB" | "en-IN" | "de-DE";

export const DICTIONARY: Record<SupportedLocale, Record<string, string>> = {
  "en-US": {
    welcome: "Welcome back",
    balance: "Current balance",
    netWorth: "Total net worth",
  },
  "en-GB": {
    welcome: "Welcome back",
    balance: "Current balance",
    netWorth: "Total net worth",
  },
  "en-IN": {
    welcome: "Welcome back",
    balance: "Current balance",
    netWorth: "Total net worth",
  },
  "de-DE": {
    welcome: "Willkommen zurück",
    balance: "Aktueller Kontostand",
    netWorth: "Gesamtvermögen",
  },
};

/**
 * Translates a key based on the active config default locale or provided override.
 */
export function translate(key: string, locale?: SupportedLocale): string {
  const config = getActiveConfig();
  const targetLocale = (locale ?? config.localization.defaultLocale) as SupportedLocale;
  const dict = DICTIONARY[targetLocale] || DICTIONARY["en-IN"];
  return dict[key] || DICTIONARY["en-IN"][key] || key;
}

/**
 * Formats currency values respecting CountryConfig rules (Lakh/Crore by default).
 */
export function formatCurrencyLocal(
  amount: number,
  locale?: SupportedLocale,
  currency?: string
): string {
  const config = getActiveConfig();
  const targetLocale = (locale ?? config.localization.defaultLocale) as SupportedLocale;
  const targetCurrency = currency ?? config.currency.code;

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency: targetCurrency,
    }).format(amount);
  } catch {
    return `${targetCurrency} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats dates respecting default configuration criteria.
 */
export function formatDateLocal(date: Date, locale?: SupportedLocale): string {
  const config = getActiveConfig();
  const targetLocale = (locale ?? config.localization.defaultLocale) as SupportedLocale;
  try {
    return new Intl.DateTimeFormat(targetLocale, {
      dateStyle: "medium",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
