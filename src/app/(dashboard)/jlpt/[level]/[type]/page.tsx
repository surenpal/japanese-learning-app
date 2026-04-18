import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { JLPT_LEVELS } from "@/lib/utils";

const VALID_TYPES = ["grammar", "vocabulary", "kanji"];

export default async function JLPTContentPage({
  params,
}: {
  params: Promise<{ level: string; type: string }>;
}) {
  const { level: levelParam, type } = await params;
  const level = levelParam.toUpperCase() as "N5" | "N4" | "N3" | "N2" | "N1";

  if (!JLPT_LEVELS.includes(level) || !VALID_TYPES.includes(type)) notFound();

  const contentType = type.toUpperCase() as "GRAMMAR" | "VOCABULARY" | "KANJI";
  const session = await auth();
  const userId = session!.user!.id as string;

  const lessons = await prisma.lesson.findMany({
    where: { examType: "JLPT", level, contentType },
    orderBy: { order: "asc" },
    include: {
      userProgress: { where: { userId } },
      grammarItems: contentType === "GRAMMAR",
      vocabularyItems: contentType === "VOCABULARY",
      kanjiItems: contentType === "KANJI",
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Badge variant={level}>{level}</Badge>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
            {level} {type}
          </h1>
          <p className="text-sm text-gray-500">{lessons.length} lessons</p>
        </div>
      </div>

      {/* Quiz shortcut */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/quizzes?examType=JLPT&level=${level}&contentType=${contentType}`}>
            Take a quiz
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={`/flashcards?examType=JLPT&level=${level}`}>
            Study flashcards
          </Link>
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400">Lessons coming soon. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const done = lesson.userProgress[0]?.completed ?? false;
            const itemCount =
              contentType === "GRAMMAR"
                ? lesson.grammarItems.length
                : contentType === "VOCABULARY"
                ? lesson.vocabularyItems.length
                : lesson.kanjiItems.length;

            return (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {done && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <CardTitle className="text-base">{lesson.title}</CardTitle>
                    </div>
                    <Badge variant="secondary">{itemCount} items</Badge>
                  </div>
                  {lesson.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lesson.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Preview items */}
                  {contentType === "VOCABULARY" && lesson.vocabularyItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {lesson.vocabularyItems.slice(0, 6).map((v) => (
                        <span key={v.id} className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                          {v.word} ({v.reading})
                        </span>
                      ))}
                    </div>
                  )}
                  {contentType === "KANJI" && lesson.kanjiItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {lesson.kanjiItems.slice(0, 8).map((k) => (
                        <span key={k.id} className="text-lg font-bold bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                          {k.character}
                        </span>
                      ))}
                    </div>
                  )}
                  {contentType === "GRAMMAR" && lesson.grammarItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {lesson.grammarItems.slice(0, 4).map((g) => (
                        <span key={g.id} className="text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-800">
                          {g.pattern}
                        </span>
                      ))}
                    </div>
                  )}
                  <Button size="sm" asChild>
                    <Link href={`/jlpt/${levelParam}/${type}/${lesson.id}`}>
                      {done ? "Review lesson" : "Start lesson"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
