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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/jlpt/${levelParam}/${type}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <Badge variant={level}>{level}</Badge>
        <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
      </div>

      {lesson.description && (
        <p className="text-gray-500 text-sm">{lesson.description}</p>
      )}

      {/* Grammar items */}
      {contentType === "GRAMMAR" && lesson.grammarItems.map((g) => (
        <Card key={g.id}>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{g.pattern}</span>
              <Badge variant="outline">{g.examType}</Badge>
            </div>
            <p className="text-gray-700 font-medium">{g.meaning}</p>
            {g.usage && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <strong>Usage: </strong>{g.usage}
              </div>
            )}
            {g.example && (
              <div className="bg-red-50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-gray-800">{g.example}</p>
                {g.exampleTrans && <p className="text-xs text-gray-500">{g.exampleTrans}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Vocabulary items */}
      {contentType === "VOCABULARY" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lesson.vocabularyItems.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-5 space-y-2">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{v.word}</p>
                  <p className="text-sm text-gray-400">{v.reading}</p>
                </div>
                <p className="text-gray-700">{v.meaning}</p>
                {v.example && (
                  <div className="bg-blue-50 rounded p-2 text-xs space-y-0.5">
                    <p className="text-gray-800">{v.example}</p>
                    {v.exampleTrans && <p className="text-gray-500">{v.exampleTrans}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Kanji items */}
      {contentType === "KANJI" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lesson.kanjiItems.map((k) => (
            <Card key={k.id}>
              <CardContent className="pt-5">
                <div className="flex gap-4">
                  <div className="text-6xl font-bold text-gray-900 w-16 flex-shrink-0">{k.character}</div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-gray-800">{k.meaning}</p>
                    {k.onyomi && <p className="text-gray-500">音: {k.onyomi}</p>}
                    {k.kunyomi && <p className="text-gray-500">訓: {k.kunyomi}</p>}
                    {k.strokeCount && <p className="text-gray-400">{k.strokeCount} strokes</p>}
                    {k.example && <p className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{k.example}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Complete / quiz */}
      <div className="flex gap-3 pt-4">
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
