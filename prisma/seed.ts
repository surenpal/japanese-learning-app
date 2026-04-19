import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import n5VocabData from "./data/n5vocabulary.json";
import n5KanjiData from "./data/n5kanji.json";
import n5GrammarData from "./data/n5grammar.json";
import n4VocabData from "./data/n4vocabulary.json";


// Load JSON produced by `npm run db:extract`, fall back to empty array
function loadJson<T>(filename: string): T[] {
  const filePath = path.join(__dirname, "data", filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Seeding database...");

  // ─── From extracted JSON (if prisma/data/*.json files exist) ─────────────────

  const jsonLessons = loadJson<{ id: string; title: string; description?: string; examType: string; level?: string; contentType: string; order: number }>("lessons.json");
  for (const l of jsonLessons) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: {},
      create: l as Parameters<typeof prisma.lesson.create>[0]["data"],
    });
  }

  const jsonVocab = loadJson<{ word: string; reading: string; meaning: string; example?: string; exampleTrans?: string; examType: string; level?: string; lessonId?: string }>("vocabulary.json");
  for (const v of jsonVocab) {
    await prisma.vocabularyItem.upsert({
      where: { id: `json-v-${v.word}-${v.reading}` },
      update: {},
      create: { id: `json-v-${v.word}-${v.reading}`, ...v } as Parameters<typeof prisma.vocabularyItem.create>[0]["data"],
    });
  }

  const jsonKanji = loadJson<{ character: string; onyomi?: string; kunyomi?: string; meaning: string; strokeCount?: number; example?: string; examType: string; level?: string; lessonId?: string }>("kanji.json");
  for (const k of jsonKanji) {
    await prisma.kanjiItem.upsert({
      where: { id: `json-k-${k.character}` },
      update: {},
      create: { id: `json-k-${k.character}`, ...k } as Parameters<typeof prisma.kanjiItem.create>[0]["data"],
    });
  }

  const jsonGrammar = loadJson<{ pattern: string; meaning: string; usage?: string; example?: string; exampleTrans?: string; examType: string; level?: string; lessonId?: string }>("grammar.json");
  for (const g of jsonGrammar) {
    await prisma.grammarItem.upsert({
      where: { id: `json-g-${g.pattern}` },
      update: {},
      create: { id: `json-g-${g.pattern}`, ...g } as Parameters<typeof prisma.grammarItem.create>[0]["data"],
    });
  }

  const jsonQuiz = loadJson<{ question: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string; explanation?: string; examType: string; level?: string; contentType: string; isPracticeExam?: boolean; setNumber?: number }>("quiz-questions.json");
  for (let i = 0; i < jsonQuiz.length; i++) {
    const q = jsonQuiz[i];
    await prisma.quizQuestion.upsert({
      where: { id: `json-q-${i + 1}` },
      update: {},
      create: { id: `json-q-${i + 1}`, ...q } as Parameters<typeof prisma.quizQuestion.create>[0]["data"],
    });
  }

  if (jsonVocab.length || jsonKanji.length || jsonGrammar.length || jsonQuiz.length) {
    console.log(`  📦 Loaded from JSON — vocab: ${jsonVocab.length}, kanji: ${jsonKanji.length}, grammar: ${jsonGrammar.length}, quiz: ${jsonQuiz.length}`);
  }

  // ─── Hiragana ────────────────────────────────────────────────────────────────
  const hiragana = [
    // a-row
    { character: "あ", romaji: "a", group: "a-row", order: 1 },
    { character: "い", romaji: "i", group: "a-row", order: 2 },
    { character: "う", romaji: "u", group: "a-row", order: 3 },
    { character: "え", romaji: "e", group: "a-row", order: 4 },
    { character: "お", romaji: "o", group: "a-row", order: 5 },
    // ka-row
    { character: "か", romaji: "ka", group: "ka-row", order: 6 },
    { character: "き", romaji: "ki", group: "ka-row", order: 7 },
    { character: "く", romaji: "ku", group: "ka-row", order: 8 },
    { character: "け", romaji: "ke", group: "ka-row", order: 9 },
    { character: "こ", romaji: "ko", group: "ka-row", order: 10 },
    // sa-row
    { character: "さ", romaji: "sa", group: "sa-row", order: 11 },
    { character: "し", romaji: "shi", group: "sa-row", order: 12 },
    { character: "す", romaji: "su", group: "sa-row", order: 13 },
    { character: "せ", romaji: "se", group: "sa-row", order: 14 },
    { character: "そ", romaji: "so", group: "sa-row", order: 15 },
    // ta-row
    { character: "た", romaji: "ta", group: "ta-row", order: 16 },
    { character: "ち", romaji: "chi", group: "ta-row", order: 17 },
    { character: "つ", romaji: "tsu", group: "ta-row", order: 18 },
    { character: "て", romaji: "te", group: "ta-row", order: 19 },
    { character: "と", romaji: "to", group: "ta-row", order: 20 },
    // na-row
    { character: "な", romaji: "na", group: "na-row", order: 21 },
    { character: "に", romaji: "ni", group: "na-row", order: 22 },
    { character: "ぬ", romaji: "nu", group: "na-row", order: 23 },
    { character: "ね", romaji: "ne", group: "na-row", order: 24 },
    { character: "の", romaji: "no", group: "na-row", order: 25 },
    // ha-row
    { character: "は", romaji: "ha", group: "ha-row", order: 26 },
    { character: "ひ", romaji: "hi", group: "ha-row", order: 27 },
    { character: "ふ", romaji: "fu", group: "ha-row", order: 28 },
    { character: "へ", romaji: "he", group: "ha-row", order: 29 },
    { character: "ほ", romaji: "ho", group: "ha-row", order: 30 },
    // ma-row
    { character: "ま", romaji: "ma", group: "ma-row", order: 31 },
    { character: "み", romaji: "mi", group: "ma-row", order: 32 },
    { character: "む", romaji: "mu", group: "ma-row", order: 33 },
    { character: "め", romaji: "me", group: "ma-row", order: 34 },
    { character: "も", romaji: "mo", group: "ma-row", order: 35 },
    // ya-row
    { character: "や", romaji: "ya", group: "ya-row", order: 36 },
    { character: "ゆ", romaji: "yu", group: "ya-row", order: 37 },
    { character: "よ", romaji: "yo", group: "ya-row", order: 38 },
    // ra-row
    { character: "ら", romaji: "ra", group: "ra-row", order: 39 },
    { character: "り", romaji: "ri", group: "ra-row", order: 40 },
    { character: "る", romaji: "ru", group: "ra-row", order: 41 },
    { character: "れ", romaji: "re", group: "ra-row", order: 42 },
    { character: "ろ", romaji: "ro", group: "ra-row", order: 43 },
    // wa-row
    { character: "わ", romaji: "wa", group: "wa-row", order: 44 },
    { character: "を", romaji: "wo", group: "wa-row", order: 45 },
    { character: "ん", romaji: "n", group: "n", order: 46 },
  ];

  for (const h of hiragana) {
    try {
      await prisma.kanaItem.upsert({
        where: { id: `h-${h.order}` },
        update: {},
        create: { id: `h-${h.order}`, ...h, type: "HIRAGANA" },
      });
    } catch (err) {
      console.error(`Failed to upsert hiragana item h-${h.order} (${h.character}):`, err);
    }
  }

  // ─── Katakana ─────────────────────────────────────────────────────────────────
  const katakana = [
    { character: "ア", romaji: "a", group: "a-row", order: 1 },
    { character: "イ", romaji: "i", group: "a-row", order: 2 },
    { character: "ウ", romaji: "u", group: "a-row", order: 3 },
    { character: "エ", romaji: "e", group: "a-row", order: 4 },
    { character: "オ", romaji: "o", group: "a-row", order: 5 },
    { character: "カ", romaji: "ka", group: "ka-row", order: 6 },
    { character: "キ", romaji: "ki", group: "ka-row", order: 7 },
    { character: "ク", romaji: "ku", group: "ka-row", order: 8 },
    { character: "ケ", romaji: "ke", group: "ka-row", order: 9 },
    { character: "コ", romaji: "ko", group: "ka-row", order: 10 },
    { character: "サ", romaji: "sa", group: "sa-row", order: 11 },
    { character: "シ", romaji: "shi", group: "sa-row", order: 12 },
    { character: "ス", romaji: "su", group: "sa-row", order: 13 },
    { character: "セ", romaji: "se", group: "sa-row", order: 14 },
    { character: "ソ", romaji: "so", group: "sa-row", order: 15 },
    { character: "タ", romaji: "ta", group: "ta-row", order: 16 },
    { character: "チ", romaji: "chi", group: "ta-row", order: 17 },
    { character: "ツ", romaji: "tsu", group: "ta-row", order: 18 },
    { character: "テ", romaji: "te", group: "ta-row", order: 19 },
    { character: "ト", romaji: "to", group: "ta-row", order: 20 },
    { character: "ナ", romaji: "na", group: "na-row", order: 21 },
    { character: "ニ", romaji: "ni", group: "na-row", order: 22 },
    { character: "ヌ", romaji: "nu", group: "na-row", order: 23 },
    { character: "ネ", romaji: "ne", group: "na-row", order: 24 },
    { character: "ノ", romaji: "no", group: "na-row", order: 25 },
    { character: "ハ", romaji: "ha", group: "ha-row", order: 26 },
    { character: "ヒ", romaji: "hi", group: "ha-row", order: 27 },
    { character: "フ", romaji: "fu", group: "ha-row", order: 28 },
    { character: "ヘ", romaji: "he", group: "ha-row", order: 29 },
    { character: "ホ", romaji: "ho", group: "ha-row", order: 30 },
    { character: "マ", romaji: "ma", group: "ma-row", order: 31 },
    { character: "ミ", romaji: "mi", group: "ma-row", order: 32 },
    { character: "ム", romaji: "mu", group: "ma-row", order: 33 },
    { character: "メ", romaji: "me", group: "ma-row", order: 34 },
    { character: "モ", romaji: "mo", group: "ma-row", order: 35 },
    { character: "ヤ", romaji: "ya", group: "ya-row", order: 36 },
    { character: "ユ", romaji: "yu", group: "ya-row", order: 37 },
    { character: "ヨ", romaji: "yo", group: "ya-row", order: 38 },
    { character: "ラ", romaji: "ra", group: "ra-row", order: 39 },
    { character: "リ", romaji: "ri", group: "ra-row", order: 40 },
    { character: "ル", romaji: "ru", group: "ra-row", order: 41 },
    { character: "レ", romaji: "re", group: "ra-row", order: 42 },
    { character: "ロ", romaji: "ro", group: "ra-row", order: 43 },
    { character: "ワ", romaji: "wa", group: "wa-row", order: 44 },
    { character: "ヲ", romaji: "wo", group: "wa-row", order: 45 },
    { character: "ン", romaji: "n", group: "n", order: 46 },
  ];

  for (const k of katakana) {
    try {
      await prisma.kanaItem.upsert({
        where: { id: `k-${k.order}` },
        update: {},
        create: { id: `k-${k.order}`, ...k, type: "KATAKANA" },
      });
    } catch (err) {
      console.error(`Failed to upsert katakana item k-${k.order} (${k.character}):`, err);
    }
  }

  // ─── JLPT N5 Vocabulary — split into sets of 35 ─────────────────────────────
  const SET_SIZE = 35;
  const allVocab = n5VocabData as { word: string; reading: string; meaning: string; example?: string; exampleTrans?: string }[];
  const totalSets = Math.ceil(allVocab.length / SET_SIZE);

  for (let setNum = 1; setNum <= totalSets; setNum++) {
    const setData = allVocab.slice((setNum - 1) * SET_SIZE, setNum * SET_SIZE);
    const lessonId = `n5-vocab-set-${String(setNum).padStart(2, "0")}`;

    await prisma.lesson.upsert({
      where: { id: lessonId },
      update: { order: setNum },
      create: {
        id: lessonId,
        title: `N5 Vocabulary — Set ${setNum}`,
        description: `N5 vocabulary set ${setNum} of ${totalSets} (${setData.length} words).`,
        examType: "JLPT",
        level: "N5",
        contentType: "VOCABULARY",
        order: setNum,
      },
    });

    const validIds = setData.map((_, i) => `n5-vs${setNum}-${i + 1}`);
    await prisma.vocabularyItem.deleteMany({
      where: { lessonId, id: { notIn: validIds } },
    });

    for (let i = 0; i < setData.length; i++) {
      const v = setData[i];
      const id = `n5-vs${setNum}-${i + 1}`;
      try {
        await prisma.vocabularyItem.upsert({
          where: { id },
          update: {},
          create: { id, ...v, examType: "JLPT", level: "N5", lessonId },
        });
      } catch (err) {
        console.error(`Failed to upsert vocab set ${setNum} item ${id} (${v.word}):`, err);
      }
    }
    console.log(`  ✓ N5 Vocab Set ${setNum}/${totalSets} — ${setData.length} words`);
  }

  // ─── JLPT N4 Vocabulary — split into sets of 35 ─────────────────────────────
  const allN4Vocab = n4VocabData as { word: string; reading: string; meaning: string; example?: string; exampleTrans?: string }[];
  const totalN4Sets = Math.ceil(allN4Vocab.length / SET_SIZE);

  for (let setNum = 1; setNum <= totalN4Sets; setNum++) {
    const setData = allN4Vocab.slice((setNum - 1) * SET_SIZE, setNum * SET_SIZE);
    const lessonId = `n4-vocab-set-${String(setNum).padStart(2, "0")}`;

    await prisma.lesson.upsert({
      where: { id: lessonId },
      update: { order: setNum },
      create: {
        id: lessonId,
        title: `N4 Vocabulary — Set ${setNum}`,
        description: `N4 vocabulary set ${setNum} of ${totalN4Sets} (${setData.length} words).`,
        examType: "JLPT",
        level: "N4",
        contentType: "VOCABULARY",
        order: setNum,
      },
    });

    const validIds = setData.map((_, i) => `n4-vs${setNum}-${i + 1}`);
    await prisma.vocabularyItem.deleteMany({
      where: { lessonId, id: { notIn: validIds } },
    });

    for (let i = 0; i < setData.length; i++) {
      const v = setData[i];
      const id = `n4-vs${setNum}-${i + 1}`;
      try {
        await prisma.vocabularyItem.upsert({
          where: { id },
          update: {},
          create: { id, ...v, examType: "JLPT", level: "N4", lessonId },
        });
      } catch (err) {
        console.error(`Failed to upsert N4 vocab set ${setNum} item ${id} (${v.word}):`, err);
      }
    }
    console.log(`  ✓ N4 Vocab Set ${setNum}/${totalN4Sets} — ${setData.length} words`);
  }

 // ─── JLPT N5 Grammar Lesson ───────────────────────────────────────────────────
  const n5GrammarLesson = await prisma.lesson.upsert({
    where: { id: "n5-grammar-1" },
    update: {},
    create: {
      id: "n5-grammar-1",
      title: "N5 Grammar — Basic Sentence Patterns",
      description: "Fundamental grammar patterns for N5: は、が、を、に、で、も",
      examType: "JLPT",
      level: "N5",
      contentType: "GRAMMAR",
      order: 1,
    },
  });
  const n5Grammar = n5GrammarData;

  for (let i = 0; i < n5Grammar.length; i++) {
    const g = n5Grammar[i];
    const id = `n5-g-${i + 1}`;

    // 🔹 Collect all examples dynamically
    const examples: { jp: string; en: string }[] = [];
    const gFlat = g as Record<string, unknown>; // ← fixes ts(7053)
    let index = 1;
    while (gFlat[`example${index}`] && gFlat[`exampleTrans${index}`]) {
      examples.push({
        jp: gFlat[`example${index}`] as string,
        en: gFlat[`exampleTrans${index}`] as string,
      });
      index++;
    }

    try {
      await prisma.grammarItem.upsert({
        where: { id },
        update: { examples, usage: g.usage },
        create: {
          id,
          pattern: g.pattern,
          meaning: g.meaning,
          usage: g.usage,
          examples,
          examType: "JLPT",
          level: "N5",
          lessonId: n5GrammarLesson.id,
        },
      });
    } catch (err) {
      console.error(`Failed to upsert grammar item ${id} (${g.pattern}):`, err);
    }
  }
  // ─── JLPT N5 Kanji Lesson ────────────────────────────────────────────────────
  const n5KanjiLesson = await prisma.lesson.upsert({
    where: { id: "n5-kanji-1" },
    update: {},
    create: {
      id: "n5-kanji-1",
      title: "N5 Kanji — Basic Characters",
      description: "Essential kanji for N5: numbers, days, common words",
      examType: "JLPT",
      level: "N5",
      contentType: "KANJI",
      order: 1,
    },
  });

  const n5Kanji = n5KanjiData as {
    character: string;
    onyomi?: string;
    kunyomi?: string;
    meaning: string;
    strokeCount?: number;
    commonWords?: string[][];
    example?: string;
    Hiragana?: string;
    exampleTrans?: string;
  }[];

  // Remove stale kanji records (e.g. from old index-based IDs) before upserting
  const validKanjiIds = n5Kanji.map((k) => `n5-k-${k.character}`);
  await prisma.kanjiItem.deleteMany({
    where: { lessonId: n5KanjiLesson.id, id: { notIn: validKanjiIds } },
  });

  for (let i = 0; i < n5Kanji.length; i++) {
    const k = n5Kanji[i];
    const id = `n5-k-${k.character}`;
    try {
      await prisma.kanjiItem.upsert({
        where: { id },
        update: {
          commonWords: k.commonWords ?? [],
          example: k.example,
          hiragana: k.Hiragana,
          exampleTrans: k.exampleTrans,
        },
        create: {
          id,
          character: k.character,
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          meaning: k.meaning,
          strokeCount: k.strokeCount,
          commonWords: k.commonWords ?? [],
          example: k.example,
          hiragana: k.Hiragana,
          exampleTrans: k.exampleTrans,
          examType: "JLPT",
          level: "N5",
          lessonId: n5KanjiLesson.id,
        },
      });
    } catch (err) {
      console.error(`Failed to upsert kanji item ${id} (${k.character}):`, err);
    }
  }
  console.log(`  ✓ N5 Kanji — ${n5Kanji.length} characters`);

  // ─── JLPT N5 Quiz Questions ───────────────────────────────────────────────────
  const n5QuizQuestions = [
    {
      id: "n5-q-1",
      question: "What is the meaning of 「水」?",
      optionA: "Fire",
      optionB: "Water",
      optionC: "Mountain",
      optionD: "Tree",
      correctAnswer: "B",
      explanation: "水 (みず) means 'water'. It is also used in 水曜日 (Wednesday).",
      examType: "JLPT" as const,
      level: "N5" as const,
      contentType: "KANJI" as const,
    },
    {
      id: "n5-q-2",
      question: "Which particle marks the direct object of a verb?",
      optionA: "は",
      optionB: "に",
      optionC: "を",
      optionD: "で",
      correctAnswer: "C",
      explanation: "を (wo) is the object marker particle. Example: ごはんを食べます (I eat rice).",
      examType: "JLPT" as const,
      level: "N5" as const,
      contentType: "GRAMMAR" as const,
    },
    {
      id: "n5-q-3",
      question: "What does 「食べる」 mean?",
      optionA: "To drink",
      optionB: "To sleep",
      optionC: "To eat",
      optionD: "To walk",
      correctAnswer: "C",
      explanation: "食べる (たべる) means 'to eat'. Example: ごはんを食べます。",
      examType: "JLPT" as const,
      level: "N5" as const,
      contentType: "VOCABULARY" as const,
    },
    {
      id: "n5-q-4",
      question: "Which sentence uses に correctly?",
      optionA: "電車に乗ります",
      optionB: "本にあります",
      optionC: "音楽に聞きます",
      optionD: "バスに行かない",
      correctAnswer: "A",
      explanation: "電車に乗ります (I take the train) — に correctly marks the vehicle for 乗る.",
      examType: "JLPT" as const,
      level: "N5" as const,
      contentType: "GRAMMAR" as const,
    },
    {
      id: "n5-q-5",
      question: "What is the reading of 「山」?",
      optionA: "かわ",
      optionB: "やま",
      optionC: "き",
      optionD: "ひ",
      correctAnswer: "B",
      explanation: "山 is read as やま (yama) and means mountain.",
      examType: "JLPT" as const,
      level: "N5" as const,
      contentType: "KANJI" as const,
    },
  ];

  for (const q of n5QuizQuestions) {
    try {
      await prisma.quizQuestion.upsert({ where: { id: q.id }, update: {}, create: q });
    } catch (err) {
      console.error(`Failed to upsert quiz question ${q.id}:`, err);
    }
  }

  // ─── JFT Practice Questions ───────────────────────────────────────────────────
  const jftPracticeQuestions = [
    {
      id: "jft-q-1",
      question: "あなたは（　　）に住んでいます。",
      optionA: "どこ",
      optionB: "なに",
      optionC: "だれ",
      optionD: "いつ",
      correctAnswer: "A",
      explanation: "どこ means 'where'. The sentence asks: 'Where do you live?'",
      examType: "JFT" as const,
      level: null,
      contentType: "GRAMMAR" as const,
      isPracticeExam: true,
      setNumber: 1,
    },
    {
      id: "jft-q-2",
      question: "会社に（　　）で行きますか。",
      optionA: "なに",
      optionB: "どれ",
      optionC: "なんで",
      optionD: "いつ",
      correctAnswer: "C",
      explanation: "なんで means 'by what means'. The sentence asks: 'How do you get to the company?'",
      examType: "JFT" as const,
      level: null,
      contentType: "GRAMMAR" as const,
      isPracticeExam: true,
      setNumber: 1,
    },
    {
      id: "jft-q-3",
      question: "What does 「仕事」 mean?",
      optionA: "House",
      optionB: "Work/Job",
      optionC: "School",
      optionD: "Family",
      correctAnswer: "B",
      explanation: "仕事 (しごと) means 'work' or 'job'.",
      examType: "JFT" as const,
      level: null,
      contentType: "VOCABULARY" as const,
      isPracticeExam: true,
      setNumber: 1,
    },
  ];

  for (const q of jftPracticeQuestions) {
    try {
      await prisma.quizQuestion.upsert({ where: { id: q.id }, update: {}, create: q });
    } catch (err) {
      console.error(`Failed to upsert JFT question ${q.id}:`, err);
    }
  }

  // ─── Skills Test Practice Questions ──────────────────────────────────────────
  const skillTestQuestions = [
    {
      id: "st-q-1",
      question: "What does 「安全」 mean in a workplace context?",
      optionA: "Dangerous",
      optionB: "Safety / Safe",
      optionC: "Equipment",
      optionD: "Instruction",
      correctAnswer: "B",
      explanation: "安全 (あんぜん) means safety. Very common in workplace Japanese.",
      examType: "SKILL_TEST" as const,
      level: null,
      contentType: "VOCABULARY" as const,
      isPracticeExam: true,
      setNumber: 1,
    },
    {
      id: "st-q-2",
      question: "「この機械を使って（　　）ください。」",
      optionA: "いて",
      optionB: "います",
      optionC: "つかって",
      optionD: "つかいます",
      correctAnswer: "A",
      explanation: "〜てください is the request form. 使って (つかって) + ください = Please use.",
      examType: "SKILL_TEST" as const,
      level: null,
      contentType: "GRAMMAR" as const,
      isPracticeExam: true,
      setNumber: 1,
    },
  ];

  for (const q of skillTestQuestions) {
    try {
      await prisma.quizQuestion.upsert({ where: { id: q.id }, update: {}, create: q });
    } catch (err) {
      console.error(`Failed to upsert skill-test question ${q.id}:`, err);
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
