import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_CODES, LOCALE_COOKIE } from "./i18n-config";

export async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  if (raw && LOCALE_CODES.includes(raw)) return raw;
  return DEFAULT_LOCALE;
}
