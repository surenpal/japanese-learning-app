import * as fs from "fs";
import * as path from "path";

// Import locale list — use dynamic require since this is a script
const { LOCALES } = require("../src/lib/i18n-config") as {
  LOCALES: { code: string; label: string; flag: string; myMemoryCode: string }[];
};

const MESSAGES_DIR = path.join(process.cwd(), "messages");
const EN_FILE = path.join(MESSAGES_DIR, "en.json");
const DELAY_MS = 1200;
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

type NestedValue = string | string[] | Record<string, unknown> | NestedValue[];

function flattenStrings(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof obj === "string") {
    out[prefix] = obj;
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) =>
      Object.assign(out, flattenStrings(v, `${prefix}.${i}`))
    );
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      Object.assign(out, flattenStrings(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return out;
}

function setByPath(obj: Record<string, unknown>, dotPath: string, value: unknown) {
  const parts = dotPath.split(".");
  let cur = obj as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextIsIndex = !isNaN(Number(parts[i + 1]));
    if (!(part in cur) || typeof cur[part] !== "object" || cur[part] === null) {
      cur[part] = nextIsIndex ? [] : {};
    }
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

async function translateText(text: string, targetLang: string): Promise<string> {
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    responseData: { translatedText: string };
    responseStatus: number;
  };
  if (data.responseStatus !== 200) throw new Error(`MyMemory ${data.responseStatus}`);
  return data.responseData.translatedText;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateLocale(
  locale: { code: string; label: string; flag: string; myMemoryCode: string },
  flat: Record<string, string>,
  force: boolean
) {
  const outFile = path.join(MESSAGES_DIR, `${locale.code}.json`);

  let existing: Record<string, unknown> = {};
  let existingFlat: Record<string, string> = {};
  if (!force && fs.existsSync(outFile)) {
    existing = JSON.parse(fs.readFileSync(outFile, "utf-8"));
    existingFlat = flattenStrings(existing) as Record<string, string>;
  }

  const result: Record<string, unknown> = { ...existing };
  const allKeys = Object.keys(flat);
  const pendingKeys = allKeys.filter((k) => !existingFlat[k]);
  let done = 0;

  if (pendingKeys.length === 0) {
    console.log(`  Already complete — skipping.`);
    return;
  }

  for (const key of pendingKeys) {
    const original = flat[key];
    try {
      const translated = await translateText(original, locale.myMemoryCode);
      setByPath(result, key, translated);
      done++;
      process.stdout.write(
        `  [${locale.code}] ${done}/${pendingKeys.length} "${original.slice(0, 25)}" → "${translated.slice(0, 25)}"\r`
      );
    } catch (e) {
      console.error(`\n  ERROR [${key}]: ${e}`);
      setByPath(result, key, original);
    }
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    await sleep(DELAY_MS);
  }

  console.log(`\n  Saved ${outFile} (${done} new translations)`);
}

async function main() {
  const args = process.argv.slice(2);
  const singleLocale = args.find((a) => a.startsWith("--locale="))?.split("=")[1];
  const force = args.includes("--force");

  if (!fs.existsSync(EN_FILE)) {
    console.error("messages/en.json not found. Run: npm run i18n:build-en");
    process.exit(1);
  }

  const en = JSON.parse(fs.readFileSync(EN_FILE, "utf-8"));
  const flat = flattenStrings(en);
  console.log(`Source strings: ${Object.keys(flat).length}`);

  const targets = singleLocale
    ? LOCALES.filter(
        (l: { code: string }) => l.code === singleLocale && l.code !== "en"
      )
    : LOCALES.filter((l: { code: string }) => l.code !== "en");

  if (targets.length === 0) {
    console.error(`Locale "${singleLocale}" not found or is English.`);
    process.exit(1);
  }

  for (const locale of targets) {
    console.log(`\nTranslating → ${locale.flag} ${locale.label} (${locale.code})`);
    await translateLocale(locale, flat, force);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
