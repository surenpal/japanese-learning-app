/**
 * prisma/extract.ts
 *
 * Reads source Excel/PDF files and outputs clean JSON files into prisma/data/.
 * Run once (or whenever source files change):
 *
 *   npx tsx prisma/extract.ts
 *
 * Expected Excel file: source-data/japanese-content.xlsx
 * Expected sheets:
 *   - Vocabulary    → prisma/data/vocabulary.json
 *   - Kanji         → prisma/data/kanji.json
 *   - Grammar       → prisma/data/grammar.json
 *   - QuizQuestions → prisma/data/quiz-questions.json
 *   - Lessons       → prisma/data/lessons.json
 *
 * Optional PDF files in source-data/*.pdf are extracted as raw text
 * into prisma/data/pdf-raw/ for manual review / further parsing.
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
const pdf = require("pdf-parse");

// ─── Paths ────────────────────────────────────────────────────────────────────

const SOURCE_DIR = path.join(__dirname, "../source-data");
const EXCEL_FILE = path.join(SOURCE_DIR, "japanese-content.xlsx");
const OUT_DIR = path.join(__dirname, "data");
const PDF_OUT_DIR = path.join(OUT_DIR, "pdf-raw");

// ─── Types (mirror your Prisma schema) ───────────────────────────────────────

interface RawLesson {
  id: string;
  title: string;
  description?: string;
  examType: "JLPT" | "JFT" | "SKILL_TEST";
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  contentType: "GRAMMAR" | "VOCABULARY" | "KANJI" | "HIRAGANA" | "KATAKANA";
  order: number;
}

interface RawVocabulary {
  word: string;
  reading: string;
  meaning: string;
  example?: string;
  exampleTrans?: string;
  examType: "JLPT" | "JFT" | "SKILL_TEST";
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  lessonId?: string;
}

interface RawKanji {
  character: string;
  onyomi?: string;
  kunyomi?: string;
  meaning: string;
  strokeCount?: number;
  example?: string;
  examType: "JLPT" | "JFT" | "SKILL_TEST";
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  lessonId?: string;
}

interface RawGrammar {
  pattern: string;
  meaning: string;
  usage?: string;
  example?: string;
  exampleTrans?: string;
  examType: "JLPT" | "JFT" | "SKILL_TEST";
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  lessonId?: string;
}

interface RawQuizQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  examType: "JLPT" | "JFT" | "SKILL_TEST";
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  contentType: "GRAMMAR" | "VOCABULARY" | "KANJI";
  isPracticeExam?: boolean;
  setNumber?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✅ Written: ${path.relative(process.cwd(), filePath)} (${(data as unknown[]).length} rows)`);
}

function getSheet(workbook: XLSX.WorkBook, sheetName: string): unknown[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`  ⚠️  Sheet "${sheetName}" not found — skipping`);
    return [];
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

/** Normalise a value that might be blank/undefined to undefined */
function opt(val: unknown): string | undefined {
  const s = String(val ?? "").trim();
  return s === "" ? undefined : s;
}

function optInt(val: unknown): number | undefined {
  const n = Number(val);
  return isNaN(n) || val === "" ? undefined : n;
}

function toBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  return String(val).trim().toLowerCase() === "true" || String(val).trim() === "1";
}

// ─── Excel extraction ─────────────────────────────────────────────────────────

function extractExcel() {
  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`❌ Excel file not found: ${EXCEL_FILE}`);
    console.error(`   Create the file or update EXCEL_FILE path in extract.ts`);
    process.exit(1);
  }

  console.log(`\n📊 Reading Excel: ${path.relative(process.cwd(), EXCEL_FILE)}`);
  const workbook = XLSX.readFile(EXCEL_FILE);
  console.log(`   Sheets found: ${workbook.SheetNames.join(", ")}`);

  // ── Lessons ────────────────────────────────────────────────────────────────
  const lessonRows = getSheet(workbook, "Lessons") as Record<string, unknown>[];
  const lessons: RawLesson[] = lessonRows.map((row) => ({
    id: String(row["id"]).trim(),
    title: String(row["title"]).trim(),
    description: opt(row["description"]),
    examType: String(row["examType"]).trim() as RawLesson["examType"],
    level: opt(row["level"]) as RawLesson["level"],
    contentType: String(row["contentType"]).trim() as RawLesson["contentType"],
    order: Number(row["order"]),
  }));
  writeJson(path.join(OUT_DIR, "lessons.json"), lessons);

  // ── Vocabulary ─────────────────────────────────────────────────────────────
  const vocabRows = getSheet(workbook, "Vocabulary") as Record<string, unknown>[];
  const vocabulary: RawVocabulary[] = vocabRows.map((row) => ({
    word: String(row["word"]).trim(),
    reading: String(row["reading"]).trim(),
    meaning: String(row["meaning"]).trim(),
    example: opt(row["example"]),
    exampleTrans: opt(row["exampleTrans"]),
    examType: String(row["examType"]).trim() as RawVocabulary["examType"],
    level: opt(row["level"]) as RawVocabulary["level"],
    lessonId: opt(row["lessonId"]),
  }));
  writeJson(path.join(OUT_DIR, "vocabulary.json"), vocabulary);

  // ── Kanji ──────────────────────────────────────────────────────────────────
  const kanjiRows = getSheet(workbook, "Kanji") as Record<string, unknown>[];
  const kanji: RawKanji[] = kanjiRows.map((row) => ({
    character: String(row["character"]).trim(),
    onyomi: opt(row["onyomi"]),
    kunyomi: opt(row["kunyomi"]),
    meaning: String(row["meaning"]).trim(),
    strokeCount: optInt(row["strokeCount"]),
    example: opt(row["example"]),
    examType: String(row["examType"]).trim() as RawKanji["examType"],
    level: opt(row["level"]) as RawKanji["level"],
    lessonId: opt(row["lessonId"]),
  }));
  writeJson(path.join(OUT_DIR, "kanji.json"), kanji);

  // ── Grammar ────────────────────────────────────────────────────────────────
  const grammarRows = getSheet(workbook, "Grammar") as Record<string, unknown>[];
  const grammar: RawGrammar[] = grammarRows.map((row) => ({
    pattern: String(row["pattern"]).trim(),
    meaning: String(row["meaning"]).trim(),
    usage: opt(row["usage"]),
    example: opt(row["example"]),
    exampleTrans: opt(row["exampleTrans"]),
    examType: String(row["examType"]).trim() as RawGrammar["examType"],
    level: opt(row["level"]) as RawGrammar["level"],
    lessonId: opt(row["lessonId"]),
  }));
  writeJson(path.join(OUT_DIR, "grammar.json"), grammar);

  // ── Quiz Questions ─────────────────────────────────────────────────────────
  const quizRows = getSheet(workbook, "QuizQuestions") as Record<string, unknown>[];
  const quizQuestions: RawQuizQuestion[] = quizRows.map((row) => ({
    question: String(row["question"]).trim(),
    optionA: String(row["optionA"]).trim(),
    optionB: String(row["optionB"]).trim(),
    optionC: String(row["optionC"]).trim(),
    optionD: String(row["optionD"]).trim(),
    correctAnswer: String(row["correctAnswer"]).trim(),
    explanation: opt(row["explanation"]),
    examType: String(row["examType"]).trim() as RawQuizQuestion["examType"],
    level: opt(row["level"]) as RawQuizQuestion["level"],
    contentType: String(row["contentType"]).trim() as RawQuizQuestion["contentType"],
    isPracticeExam: toBool(row["isPracticeExam"]),
    setNumber: optInt(row["setNumber"]),
  }));
  writeJson(path.join(OUT_DIR, "quiz-questions.json"), quizQuestions);
}

// ─── PDF extraction ───────────────────────────────────────────────────────────

async function extractPdfs() {
  if (!fs.existsSync(SOURCE_DIR)) return;

  const pdfFiles = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.log("\n📄 No PDF files found in source-data/ — skipping PDF extraction");
    return;
  }

  console.log(`\n📄 Extracting ${pdfFiles.length} PDF file(s)...`);
  ensureDir(PDF_OUT_DIR);

  for (const file of pdfFiles) {
    const filePath = path.join(SOURCE_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);

    const outFile = path.join(PDF_OUT_DIR, file.replace(".pdf", ".txt"));
    fs.writeFileSync(outFile, data.text, "utf-8");
    console.log(`  ✅ ${file} → ${path.relative(process.cwd(), outFile)} (${data.numpages} pages)`);
  }

  console.log(`\n  ℹ️  PDF text files are in prisma/data/pdf-raw/`);
  console.log(`     Review them and manually structure into JSON if needed.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  ensureDir(OUT_DIR);

  extractExcel();
  await extractPdfs();

  console.log("\n🎉 Extraction complete! Now run: npm run db:seed");
}

main().catch((err) => {
  console.error("❌ Extraction failed:", err);
  process.exit(1);
});
