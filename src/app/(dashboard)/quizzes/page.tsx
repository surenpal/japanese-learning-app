import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuizClient } from "@/components/quiz/quiz-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

interface SearchParams {
  examType?: string;
  level?: string;
  contentType?: string;
  isPracticeExam?: string;
  setNumber?: string;
}

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const userId = session!.user!.id as string;

  // Build filter
  const where: Record<string, unknown> = {};
  if (sp.examType) where.examType = sp.examType;
  if (sp.level) where.level = sp.level;
  if (sp.contentType) where.contentType = sp.contentType;
  if (sp.isPracticeExam === "true") where.isPracticeExam = true;
  if (sp.setNumber) where.setNumber = parseInt(sp.setNumber);

  const hasFilter = Object.keys(where).length > 0;

  const questions = hasFilter
    ? await prisma.quizQuestion.findMany({
        where,
        orderBy: { createdAt: "asc" },
        take: 20,
      })
    : [];

  // Recent attempts
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (!hasFilter) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quizzes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Test your knowledge across all exam types</p>
        </div>

        {/* Quick select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "JLPT N5 Vocabulary", href: "/quizzes?examType=JLPT&level=N5&contentType=VOCABULARY" },
            { label: "JLPT N5 Grammar", href: "/quizzes?examType=JLPT&level=N5&contentType=GRAMMAR" },
            { label: "JLPT N4 Vocabulary", href: "/quizzes?examType=JLPT&level=N4&contentType=VOCABULARY" },
            { label: "JLPT N4 Kanji", href: "/quizzes?examType=JLPT&level=N4&contentType=KANJI" },
            { label: "JFT Practice Exam", href: "/quizzes?examType=JFT&isPracticeExam=true" },
            { label: "Skills Test — Set 1", href: "/quizzes?examType=SKILL_TEST&setNumber=1&isPracticeExam=true" },
          ].map(({ label, href }) => (
            <Button key={href} variant="outline" asChild className="h-auto py-4 justify-start">
              <Link href={href}>
                <LayoutGrid className="w-4 h-4 mr-2 text-gray-400" />
                {label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Recent history */}
        {recentAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAttempts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {a.examType} {a.level ?? ""} {a.contentType}
                      </span>
                      <p className="text-xs text-gray-400">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`font-bold ${a.score / a.total >= 0.7 ? "text-green-600" : "text-red-600"}`}>
                      {a.score}/{a.total}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/quizzes">← Back</Link>
        </Button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {sp.examType} {sp.level ?? ""} {sp.contentType ?? "Practice Exam"}
          {sp.setNumber ? ` — Set ${sp.setNumber}` : ""}
        </h1>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400">No questions found for this selection.</p>
            <Button className="mt-4" asChild><Link href="/quizzes">Back to quizzes</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <QuizClient
          questions={questions}
          examType={sp.examType ?? "JLPT"}
          level={sp.level}
          contentType={sp.contentType ?? "VOCABULARY"}
        />
      )}
    </div>
  );
}
