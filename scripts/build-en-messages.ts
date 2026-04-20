import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const messages: Record<string, Record<string, unknown>> = {
    kanji: {},
    vocab: {},
    grammar: {},
    lessons: {},
  };

  // Kanji
  const kanjiItems = await (prisma as any).kanjiItem.findMany();
  for (const k of kanjiItems) {
    const cw = (k.commonWords as string[][] | null) ?? [];
    messages.kanji[k.character] = {
      meaning: k.meaning,
      ...(k.exampleTrans ? { exampleTrans: k.exampleTrans } : {}),
      ...(cw.length > 0 ? { commonWords: cw.map((w: string[]) => w[2] ?? "") } : {}),
    };
  }

  // Vocabulary
  const vocabItems = await (prisma as any).vocabularyItem.findMany();
  for (const v of vocabItems) {
    messages.vocab[v.word] = {
      meaning: v.meaning,
      ...(v.exampleTrans ? { exampleTrans: v.exampleTrans } : {}),
    };
  }

  // Grammar
  const grammarItems = await (prisma as any).grammarItem.findMany();
  for (const g of grammarItems) {
    const usage = g.usage as { a?: string; b?: string } | null;
    const exs = (g.examples as { jp: string; en: string }[] | null) ?? [];
    messages.grammar[g.pattern] = {
      meaning: g.meaning,
      ...(usage?.a ? { usage_a: usage.a } : {}),
      ...(usage?.b ? { usage_b: usage.b } : {}),
      ...(g.commonMistakes ? { commonMistakes: g.commonMistakes } : {}),
      ...(exs.length > 0 ? { exampleTrans: exs.map((e) => e.en).filter(Boolean) } : {}),
    };
  }

  // Lessons
  const lessons = await (prisma as any).lesson.findMany();
  for (const l of lessons) {
    messages.lessons[l.title] = {
      title: l.title,
      ...(l.description ? { description: l.description } : {}),
    };
  }

  const outDir = path.join(process.cwd(), "messages");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "en.json");
  fs.writeFileSync(outPath, JSON.stringify(messages, null, 2));
  console.log(`Written ${outPath}`);
  console.log(`  kanji: ${Object.keys(messages.kanji).length} entries`);
  console.log(`  vocab: ${Object.keys(messages.vocab).length} entries`);
  console.log(`  grammar: ${Object.keys(messages.grammar).length} entries`);
  console.log(`  lessons: ${Object.keys(messages.lessons).length} entries`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
