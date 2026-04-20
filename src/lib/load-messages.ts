import * as fs from "fs";
import * as path from "path";
import { DEFAULT_LOCALE } from "./i18n-config";

export async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
  const fallbackPath = path.join(process.cwd(), "messages", `${DEFAULT_LOCALE}.json`);

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    try {
      return JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
    } catch {
      return {};
    }
  }
}
