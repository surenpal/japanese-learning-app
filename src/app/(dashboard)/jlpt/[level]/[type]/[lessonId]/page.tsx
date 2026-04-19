import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompleteLessonButton } from "@/components/lessons/complete-lesson-button";

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
        lesson.grammarItems.map((g) => (
          <Card key={g.id} className="hover:shadow-md transition-all duration-200">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{g.pattern}</span>
                <Badge variant="outline">{g.examType}</Badge>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{g.meaning}</p>
              {g.usage && (
                <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>{(g.usage as { a: string; b: string }).a}</p>
                  <p>{(g.usage as { a: string; b: string }).b}</p>
                </div>
              )}
              {g.examples && (g.examples as { jp: string; hiragana?: string; en: string }[]).length > 0 && (
                <div className="space-y-2">
                  {(g.examples as { jp: string; hiragana?: string; en: string }[]).map((ex, i) => (
                    <div key={i} className="border-l-2 border-red-400 dark:border-red-500 pl-3 space-y-0.5">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ex.jp}</p>
                      {ex.hiragana && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ex.hiragana}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500">{ex.en}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

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
                  {v.meaning}
                </p>
                {v.example && (
                  <div className="border-l-2 border-blue-400 dark:border-blue-500 pl-3 space-y-0.5">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{v.example}</p>
                    {v.hiragana && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{v.hiragana}</p>
                    )}
                    {v.exampleTrans && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{v.exampleTrans}</p>
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
          {lesson.kanjiItems.map((k) => (
            <Card key={k.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="pt-5 space-y-4">
                {/* Character + basic info */}
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-600">
                    <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">{k.character}</span>
                  </div>
                  <div className="space-y-1.5 text-sm pt-1 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">{k.meaning}</p>
                    {k.onyomi && (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 w-6">音</span>
                        <span className="text-gray-600 dark:text-gray-300">{k.onyomi}</span>
                      </div>
                    )}
                    {k.kunyomi && (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 w-6">訓</span>
                        <span className="text-gray-600 dark:text-gray-300">{k.kunyomi}</span>
                      </div>
                    )}
                    {k.strokeCount && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{k.strokeCount} Strokes</p>
                    )}
                  </div>
                </div>

                {/* Common Words */}
                {k.commonWords && (k.commonWords as string[][]).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Common Words：</p>
                    <div className="space-y-1">
                      {(k.commonWords as string[][]).map((w, i) => (
                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{w[0]}</span>
                          {", "}
                          <span className="text-gray-500 dark:text-gray-400">{w[1]}</span>
                          {", "}
                          <span>{w[2]}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sentence */}
                {k.example && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sentence:</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{k.example}</p>
                    {k.hiragana && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{k.hiragana}</p>
                    )}
                    {k.exampleTrans && (
                      <p className="text-sm text-gray-400 dark:text-gray-500">{k.exampleTrans}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
