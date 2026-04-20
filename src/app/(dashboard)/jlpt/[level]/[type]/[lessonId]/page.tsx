import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompleteLessonButton } from "@/components/lessons/complete-lesson-button";
import { KanjiCardSection } from "@/components/kanji/kanji-card-section";
import { getLocale } from "@/lib/get-locale";
import { loadMessages } from "@/lib/load-messages";

type Messages = Record<string, unknown>;

function tStr(msgs: Messages, section: string, key: string, field: string): string | null {
  const sec = msgs[section] as Record<string, Record<string, unknown>> | undefined;
  const entry = sec?.[key];
  const val = entry?.[field];
  return typeof val === "string" ? val : null;
}

function tStrArr(msgs: Messages, section: string, key: string, field: string): string[] | null {
  const sec = msgs[section] as Record<string, Record<string, unknown>> | undefined;
  const val = sec?.[key]?.[field];
  return Array.isArray(val) ? (val as string[]) : null;
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ level: string; type: string; lessonId: string }>;
}) {
  const { level: levelParam, type, lessonId } = await params;
  const level = levelParam.toUpperCase() as "N5" | "N4" | "N3" | "N2" | "N1";
  const contentType = type.toUpperCase() as "GRAMMAR" | "VOCABULARY" | "KANJI";

  const session = await auth();
  const userId = session!.user!.id as string;

  const locale = await getLocale();
  const messages = await loadMessages(locale);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      grammarItems: true,
      vocabularyItems: true,
      kanjiItems: true,
      userProgress: { where: { userId } },
    },
  });

  if (!lesson) notFound();

  const done = lesson.userProgress[0]?.completed ?? false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href={`/jlpt/${levelParam}/${type}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <Badge variant={level}>{level}</Badge>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
      </div>

      {lesson.description && (
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{lesson.description}</p>
      )}

      {/* Grammar items */}
      {contentType === "GRAMMAR" &&
        lesson.grammarItems.map((g) => {
          const usage = g.usage as { a: string; b: string } | null;
          const examples = (g.examples as { jp: string; hiragana?: string; en: string }[]) ?? [];
          const tExamples = tStrArr(messages, "grammar", g.pattern, "exampleTrans");
          return (
            <Card key={g.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-rose-700 dark:text-rose-400">{g.pattern}</span>
                  <Badge variant="outline">{g.examType}</Badge>
                </div>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {tStr(messages, "grammar", g.pattern, "meaning") ?? g.meaning}
                </p>
                {usage && (
                  <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>{tStr(messages, "grammar", g.pattern, "usage_a") ?? usage.a}</p>
                    <p>{tStr(messages, "grammar", g.pattern, "usage_b") ?? usage.b}</p>
                  </div>
                )}
                {g.commonMistakes && (
                  <div className="border-l-2 border-amber-400 dark:border-amber-500 pl-3 py-1.5 space-y-0.5 bg-amber-50 dark:bg-amber-950/30 rounded-r-md">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Common Mistake</p>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      {tStr(messages, "grammar", g.pattern, "commonMistakes") ?? g.commonMistakes}
                    </p>
                  </div>
                )}
                {examples.length > 0 && (
                  <div className="space-y-2">
                    {examples.map((ex, i) => (
                      <div key={i} className="border-l-2 border-red-400 dark:border-red-500 pl-3 space-y-0.5">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ex.jp}</p>
                        {ex.hiragana && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{ex.hiragana}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {tExamples?.[i] ?? ex.en}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

      {/* Vocabulary items */}
      {contentType === "VOCABULARY" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lesson.vocabularyItems.map((v) => (
            <Card key={v.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="pt-5 space-y-3">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{v.word}</p>
                  <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium mt-0.5">{v.reading}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                  {tStr(messages, "vocab", v.word, "meaning") ?? v.meaning}
                </p>
                {v.example && (
                  <div className="border-l-2 border-blue-400 dark:border-blue-500 pl-3 space-y-0.5">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{v.example}</p>
                    {v.hiragana && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{v.hiragana}</p>
                    )}
                    {v.exampleTrans && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {tStr(messages, "vocab", v.word, "exampleTrans") ?? v.exampleTrans}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Kanji items */}
      {contentType === "KANJI" && (
        <div className="grid grid-cols-1 gap-4">
          {lesson.kanjiItems.map((k) => {
            const originalWords = k.commonWords as string[][] | undefined;
            const tCommonWords = tStrArr(messages, "kanji", k.character, "commonWords");
            const mergedWords = originalWords?.map((w, i) => [w[0], w[1], tCommonWords?.[i] ?? w[2]]);
            return (
              <Card key={k.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="pt-5 space-y-4">
                  <KanjiCardSection
                    character={k.character}
                    meaning={tStr(messages, "kanji", k.character, "meaning") ?? k.meaning}
                    onyomi={k.onyomi}
                    kunyomi={k.kunyomi}
                    strokeCount={k.strokeCount}
                    commonWords={mergedWords ?? originalWords}
                  />

                  {/* Sentence */}
                  {k.example && (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Sentence:</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{k.example}</p>
                      {k.hiragana && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{k.hiragana}</p>
                      )}
                      {k.exampleTrans && (
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          {tStr(messages, "kanji", k.character, "exampleTrans") ?? k.exampleTrans}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <CompleteLessonButton lessonId={lessonId} done={done} />
        <Button variant="secondary" asChild>
          <Link href={`/quizzes?examType=JLPT&level=${level}&contentType=${contentType}`}>
            Take a quiz
          </Link>
        </Button>
      </div>
    </div>
  );
}
