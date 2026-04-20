export type Locale = {
  code: string;
  label: string;
  flag: string;
  myMemoryCode: string;
};

export const LOCALES: Locale[] = [
  { code: "en",    label: "English",                  flag: "🇬🇧", myMemoryCode: "en" },
  { code: "ne",    label: "Nepali",                   flag: "🇳🇵", myMemoryCode: "ne" },
  { code: "hi",    label: "Hindi",                    flag: "🇮🇳", myMemoryCode: "hi" },
  { code: "bn",    label: "Bengali",                  flag: "🇧🇩", myMemoryCode: "bn" },
  { code: "zh",    label: "Chinese (Simplified)",     flag: "🇨🇳", myMemoryCode: "zh-CN" },
  { code: "zh-TW", label: "Chinese (Traditional)",   flag: "🇹🇼", myMemoryCode: "zh-TW" },
  { code: "yue",   label: "Cantonese",                flag: "🇭🇰", myMemoryCode: "zh-TW" },
  { code: "ko",    label: "Korean",                   flag: "🇰🇷", myMemoryCode: "ko" },
  { code: "vi",    label: "Vietnamese",               flag: "🇻🇳", myMemoryCode: "vi" },
  { code: "th",    label: "Thai",                     flag: "🇹🇭", myMemoryCode: "th" },
  { code: "id",    label: "Bahasa Indonesia",         flag: "🇮🇩", myMemoryCode: "id" },
  { code: "ms",    label: "Bahasa Melayu",            flag: "🇲🇾", myMemoryCode: "ms" },
  { code: "tl",    label: "Tagalog",                  flag: "🇵🇭", myMemoryCode: "tl" },
  { code: "de",    label: "Deutsch",                  flag: "🇩🇪", myMemoryCode: "de" },
  { code: "fr",    label: "Français",                 flag: "🇫🇷", myMemoryCode: "fr" },
  { code: "es",    label: "Español (Europeo)",        flag: "🇪🇸", myMemoryCode: "es" },
  { code: "es-419",label: "Español (Latinoamericano)",flag: "🇲🇽", myMemoryCode: "es" },
  { code: "pt",    label: "Português (Brasileiro)",   flag: "🇧🇷", myMemoryCode: "pt" },
  { code: "pt-PT", label: "Português (Europeu)",      flag: "🇵🇹", myMemoryCode: "pt" },
  { code: "it",    label: "Italiano",                 flag: "🇮🇹", myMemoryCode: "it" },
  { code: "nl",    label: "Nederlands",               flag: "🇳🇱", myMemoryCode: "nl" },
  { code: "sv",    label: "Svenska",                  flag: "🇸🇪", myMemoryCode: "sv" },
  { code: "no",    label: "Norsk",                    flag: "🇳🇴", myMemoryCode: "no" },
  { code: "da",    label: "Dansk",                    flag: "🇩🇰", myMemoryCode: "da" },
  { code: "fi",    label: "Suomi",                    flag: "🇫🇮", myMemoryCode: "fi" },
  { code: "af",    label: "Afrikaans",                flag: "🇿🇦", myMemoryCode: "af" },
  { code: "pl",    label: "Polski",                   flag: "🇵🇱", myMemoryCode: "pl" },
  { code: "cs",    label: "Čeština",                  flag: "🇨🇿", myMemoryCode: "cs" },
  { code: "sk",    label: "Slovenčina",               flag: "🇸🇰", myMemoryCode: "sk" },
  { code: "sl",    label: "Slovenščina",              flag: "🇸🇮", myMemoryCode: "sl" },
  { code: "hr",    label: "Hrvatski",                 flag: "🇭🇷", myMemoryCode: "hr" },
  { code: "ro",    label: "Română",                   flag: "🇷🇴", myMemoryCode: "ro" },
  { code: "hu",    label: "Magyar",                   flag: "🇭🇺", myMemoryCode: "hu" },
  { code: "bg",    label: "Български",                flag: "🇧🇬", myMemoryCode: "bg" },
  { code: "uk",    label: "Українська",               flag: "🇺🇦", myMemoryCode: "uk" },
  { code: "et",    label: "Eesti keel",               flag: "🇪🇪", myMemoryCode: "et" },
  { code: "lv",    label: "Latviski",                 flag: "🇱🇻", myMemoryCode: "lv" },
  { code: "lt",    label: "Lietuvių",                 flag: "🇱🇹", myMemoryCode: "lt" },
  { code: "el",    label: "Ελληνικά",                 flag: "🇬🇷", myMemoryCode: "el" },
  { code: "tr",    label: "Türkçe",                   flag: "🇹🇷", myMemoryCode: "tr" },
  { code: "uz",    label: "O'zbekcha",                flag: "🇺🇿", myMemoryCode: "uz" },
  { code: "ka",    label: "ქართული",                  flag: "🇬🇪", myMemoryCode: "ka" },
];

export const DEFAULT_LOCALE = "en";
export const LOCALE_COOKIE = "app-locale";
export const LOCALE_CODES = LOCALES.map((l) => l.code);
