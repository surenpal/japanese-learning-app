import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, Grid3x3 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { JLPT_LEVELS, LEVEL_DESCRIPTIONS, LEVEL_COLORS } from "@/lib/utils";

export default async function JLPTPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  // Get lesson counts and user progress per level
  const levelData = await Promise.all(
    JLPT_LEVELS.map(async (level) => {
      const totalLessons = await prisma.lesson.count({
        where: { examType: "JLPT", level },
      });
      const completed = await prisma.userProgress.count({
        where: { userId, completed: true, lesson: { level } },
      });
      return { level, totalLessons, completed };
    })
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">JLPT Preparation</h1>
        <p className="text-gray-500 text-sm mt-1">
          Japanese Language Proficiency Test — N5 (Beginner) to N1 (Advanced)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {levelData.map(({ level, totalLessons, completed }) => {
          const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
          return (
            <Card key={level} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant={level as keyof typeof LEVEL_COLORS} className="text-base px-3 py-0.5">
                    {level}
                  </Badge>
                  {completed === totalLessons && totalLessons > 0 && (
                    <span className="text-xs text-green-600 font-medium">✓ Complete</span>
                  )}
                </div>
                <CardTitle className="mt-2">{level} — {levelLabel(level)}</CardTitle>
                <CardDescription>{LEVEL_DESCRIPTIONS[level]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{completed} / {totalLessons} lessons</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/jlpt/${level.toLowerCase()}/grammar`}>
                      <FileText className="w-3.5 h-3.5" />
                      Grammar
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/jlpt/${level.toLowerCase()}/vocabulary`}>
                      <BookOpen className="w-3.5 h-3.5" />
                      Vocabulary
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/jlpt/${level.toLowerCase()}/kanji`}>
                      <Grid3x3 className="w-3.5 h-3.5" />
                      Kanji
                    </Link>
                  </Button>
                </div>
                <Button className="w-full" size="sm" asChild>
                  <Link href={`/jlpt/${level.toLowerCase()}`}>
                    {completed > 0 ? "Continue studying" : "Start studying"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              { name: "JLPT Official", url: "https://www.jlpt.jp" },
              { name: "JLPT Pro", url: "https://jlptpro.com/" },
              { name: "TryJLPT", url: "https://tryjlpt.com" },
              { name: "Nihongo-Pro", url: "https://www.nihongo-pro.com" },
            ].map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
              >
                {r.name} ↗
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function levelLabel(level: string) {
  const map: Record<string, string> = {
    N5: "Beginner",
    N4: "Elementary",
    N3: "Intermediate",
    N2: "Upper-Intermediate",
    N1: "Advanced",
  };
  return map[level] ?? "";
}
