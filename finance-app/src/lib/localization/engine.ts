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

export function translate(key: string, locale: SupportedLocale = "en-US"): string {
  const dict = DICTIONARY[locale] || DICTIONARY["en-US"];
  return dict[key] || DICTIONARY["en-US"][key] || key;
}

export function formatCurrencyLocal(
  amount: number,
  locale: SupportedLocale = "en-US",
  currency = "USD"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDateLocal(date: Date, locale: SupportedLocale = "en-US"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
