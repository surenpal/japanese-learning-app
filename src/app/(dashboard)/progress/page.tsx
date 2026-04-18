import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { JLPT_LEVELS } from "@/lib/utils";
import { BookOpen, Brain, Flame, Star } from "lucide-react";

export default async function ProgressPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const [streak, totalCompleted, quizAttempts, totalFlashcards, levelStats] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.userProgress.count({ where: { userId, completed: true } }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.flashcardSRS.count({ where: { userId } }),
    Promise.all(
      JLPT_LEVELS.map(async (level) => {
        const total = await prisma.lesson.count({ where: { examType: "JLPT", level } });
        const done = await prisma.userProgress.count({
          where: { userId, completed: true, lesson: { level } },
        });
        return { level, total, done };
      })
    ),
  ]);

  const avgScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) /
            quizAttempts.length
        )
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Progress</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your learning journey at a glance</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Streak</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{streak?.currentStreak ?? 0}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Best: {streak?.longestStreak ?? 0} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Lessons</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalCompleted}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">Quiz avg</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {avgScore != null ? `${avgScore}%` : "—"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{quizAttempts.length} attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Flashcards</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalFlashcards}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">in deck</p>
          </CardContent>
        </Card>
      </div>

      {/* JLPT Progress per level */}
      <Card>
        <CardHeader>
          <CardTitle>JLPT Progress by Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {levelStats.map(({ level, total, done }) => {
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={level}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={level as "N5" | "N4" | "N3" | "N2" | "N1"}>{level}</Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{done} / {total} lessons</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pct}%</span>
                </div>
                <Progress value={pct} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quiz history */}
      {quizAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizAttempts.map((a) => {
                const pct = Math.round((a.score / a.total) * 100);
                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {a.examType} {a.level ?? ""} — {a.contentType}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {a.timeTaken && ` · ${a.timeTaken}s`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${
                          pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-600"
                        }`}
                      >
                        {a.score}/{a.total}
                      </span>
                      <p className="text-xs text-gray-400">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
