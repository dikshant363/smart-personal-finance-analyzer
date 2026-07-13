import { json, handleError } from "@/lib/api";
import { DICTIONARY, SupportedLocale } from "@/lib/localization/engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get("locale") as SupportedLocale) || "en-US";
    const dictionary = DICTIONARY[locale] || DICTIONARY["en-US"];

    return json({ dictionary }, 200);
  } catch (e) {
    return handleError(e);
  }
}
