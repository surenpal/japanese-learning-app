import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import n5GrammarData from "./data/n5-grammar.json";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Seeding database...");

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

  // ─── JLPT N5 Vocabulary Lesson ────────────────────────────────────────────────
  const n5VocabLesson = await prisma.lesson.upsert({
    where: { id: "n5-vocab-1" },
    update: {},
    create: {
      id: "n5-vocab-1",
      title: "N5 Vocabulary — Everyday Words",
      description: "Core vocabulary for daily life situations at N5 level.",
      examType: "JLPT",
      level: "N5",
      contentType: "VOCABULARY",
      order: 1,
    },
  });

  const n5Vocab = [
    { word: "水", reading: "みず", meaning: "water", example: "水を飲みます。", exampleTrans: "I drink water." },
    { word: "食べる", reading: "たべる", meaning: "to eat", example: "ごはんを食べます。", exampleTrans: "I eat rice." },
    { word: "飲む", reading: "のむ", meaning: "to drink", example: "お茶を飲みます。", exampleTrans: "I drink tea." },
    { word: "行く", reading: "いく", meaning: "to go", example: "学校に行きます。", exampleTrans: "I go to school." },
    { word: "来る", reading: "くる", meaning: "to come", example: "友達が来ます。", exampleTrans: "A friend is coming." },
    { word: "見る", reading: "みる", meaning: "to see/watch", example: "テレビを見ます。", exampleTrans: "I watch TV." },
    { word: "聞く", reading: "きく", meaning: "to listen/ask", example: "音楽を聞きます。", exampleTrans: "I listen to music." },
    { word: "話す", reading: "はなす", meaning: "to speak", example: "日本語を話します。", exampleTrans: "I speak Japanese." },
    { word: "読む", reading: "よむ", meaning: "to read", example: "本を読みます。", exampleTrans: "I read a book." },
    { word: "書く", reading: "かく", meaning: "to write", example: "手紙を書きます。", exampleTrans: "I write a letter." },
    { word: "大きい", reading: "おおきい", meaning: "big", example: "大きい犬です。", exampleTrans: "It is a big dog." },
    { word: "小さい", reading: "ちいさい", meaning: "small", example: "小さい猫がいます。", exampleTrans: "There is a small cat." }
  ];

  for (let i = 0; i < n5Vocab.length; i++) {
    const v = n5Vocab[i];
    const id = `n5-v-${i + 1}`;
    try {
      await prisma.vocabularyItem.upsert({
        where: { id },
        update: {},
        create: { id, ...v, examType: "JLPT", level: "N5", lessonId: n5VocabLesson.id },
      });
    } catch (err) {
      console.error(`Failed to upsert vocab item ${id} (${v.word}):`, err);
    }
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
    // Use index-based ID — pattern contains Japanese/tilde chars that are unsafe as DB keys.
    const id = `n5-g-${i + 1}`;
    try {
      await prisma.grammarItem.upsert({
        where: { id },
        update: {},
        create: {
          id,
          pattern: g.pattern,
          meaning: g.meaning,
          usage: g.usage,
          example: g.example,
          exampleTrans: g.exampleTrans,
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

  const n5Kanji = [
    { character: "一", onyomi: "イチ・イツ", kunyomi: "ひと", meaning: "one", strokeCount: 1, example: "一月 (January)" },
    { character: "二", onyomi: "ニ", kunyomi: "ふた", meaning: "two", strokeCount: 2, example: "二月 (February)" },
    { character: "三", onyomi: "サン", kunyomi: "み", meaning: "three", strokeCount: 3, example: "三月 (March)" },
    { character: "山", onyomi: "サン", kunyomi: "やま", meaning: "mountain", strokeCount: 3, example: "富士山" },
    { character: "川", onyomi: "セン", kunyomi: "かわ", meaning: "river", strokeCount: 3, example: "川の水" },
    { character: "日", onyomi: "ニチ・ジツ", kunyomi: "ひ・か", meaning: "sun/day", strokeCount: 4, example: "日曜日 (Sunday)" },
    { character: "月", onyomi: "ゲツ・ガツ", kunyomi: "つき", meaning: "moon/month", strokeCount: 4, example: "月曜日 (Monday)" },
    { character: "火", onyomi: "カ", kunyomi: "ひ", meaning: "fire", strokeCount: 4, example: "火曜日 (Tuesday)" },
    { character: "水", onyomi: "スイ", kunyomi: "みず", meaning: "water", strokeCount: 4, example: "水曜日 (Wednesday)" },
    { character: "木", onyomi: "モク・ボク", kunyomi: "き", meaning: "tree/wood", strokeCount: 4, example: "木曜日 (Thursday)" },
  ];

  for (let i = 0; i < n5Kanji.length; i++) {
    const k = n5Kanji[i];
    const id = `n5-k-${i + 1}`;
    try {
      await prisma.kanjiItem.upsert({
        where: { id },
        update: {},
        create: { id, ...k, examType: "JLPT", level: "N5", lessonId: n5KanjiLesson.id },
      });
    } catch (err) {
      console.error(`Failed to upsert kanji item ${id} (${k.character}):`, err);
    }
  }

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
