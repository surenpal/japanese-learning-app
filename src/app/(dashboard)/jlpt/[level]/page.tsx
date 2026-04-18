import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, FileText, Grid3x3 } from "lucide-react";
import { JLPT_LEVELS } from "@/lib/utils";

const VALID_LEVELS = JLPT_LEVELS.map((l) => l.toLowerCase());

export default async function JLPTLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelParam } = await params;
  if (!VALID_LEVELS.includes(levelParam)) notFound();

  const level = levelParam.toUpperCase() as "N5" | "N4" | "N3" | "N2" | "N1";
  const session = await auth();
  const userId = session!.user!.id as string;

  const lessons = await prisma.lesson.findMany({
    where: { examType: "JLPT", level },
    orderBy: [{ contentType: "asc" }, { order: "asc" }],
    include: {
      userProgress: { where: { userId } },
    },
  });

  const grouped = {
    GRAMMAR: lessons.filter((l) => l.contentType === "GRAMMAR"),
    VOCABULARY: lessons.filter((l) => l.contentType === "VOCABULARY"),
    KANJI: lessons.filter((l) => l.contentType === "KANJI"),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Badge variant={level}>{level}</Badge>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            JLPT {level} — {levelLabel(level)}
          </h1>
          <p className="text-sm text-gray-500">{lessons.length} lessons total</p>
        </div>
      </div>

      {(Object.entries(grouped) as [string, typeof lessons][]).map(([type, items]) => (
        <Card key={type}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {type === "GRAMMAR" && <FileText className="w-4 h-4 text-red-500" />}
                {type === "VOCABULARY" && <BookOpen className="w-4 h-4 text-blue-500" />}
                {type === "KANJI" && <Grid3x3 className="w-4 h-4 text-green-500" />}
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/jlpt/${levelParam}/${type.toLowerCase()}`}>View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Coming soon</p>
            ) : (
              <div className="space-y-2">
                {items.slice(0, 5).map((lesson) => {
                  const done = lesson.userProgress[0]?.completed ?? false;
                  return (
                    <Link
                      key={lesson.id}
                      href={`/jlpt/${levelParam}/${type.toLowerCase()}/${lesson.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {done ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-red-400 transition-colors" />
                        )}
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{lesson.title}</span>
                      </div>
                      {lesson.userProgress[0]?.score != null && (
                        <Badge variant="secondary">{lesson.userProgress[0].score}%</Badge>
                      )}
                    </Link>
                  );
                })}
                {items.length > 5 && (
                  <Button variant="ghost" size="sm" asChild className="w-full mt-1">
                    <Link href={`/jlpt/${levelParam}/${type.toLowerCase()}`}>
                      View all {items.length} lessons →
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function levelLabel(level: string) {
  const map: Record<string, string> = {
    N5: "Beginner", N4: "Elementary", N3: "Intermediate",
    N2: "Upper-Intermediate", N1: "Advanced",
  };
  return map[level] ?? "";
}
