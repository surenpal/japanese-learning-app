import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, FileText, Flame, Star, Type } from "lucide-react";

const quickLinks = [
  { href: "/jlpt", label: "JLPT", icon: BookOpen, color: "text-red-600 bg-red-50" },
  { href: "/jft", label: "JFT", icon: Star, color: "text-blue-600 bg-blue-50" },
  { href: "/skill-test", label: "Skills Test", icon: FileText, color: "text-green-600 bg-green-50" },
  { href: "/hiragana-katakana", label: "Kana", icon: Type, color: "text-yellow-600 bg-yellow-50" },
  { href: "/flashcards", label: "Flashcards", icon: Brain, color: "text-purple-600 bg-purple-50" },
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Unable to load session. Please <a href="/login" className="text-red-600 underline">sign in again</a>.</p>
      </div>
    );
  }

  const [streak, recentProgress, dueFlashcards] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.userProgress.findMany({
      where: { userId, completed: true },
      include: { lesson: true },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    prisma.flashcardSRS.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    }),
  ]);

  const totalCompleted = await prisma.userProgress.count({ where: { userId, completed: true } });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Learner"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{streak?.currentStreak ?? 0}</p>
                <p className="text-xs text-gray-500">Day streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCompleted}</p>
                <p className="text-xs text-gray-500">Lessons done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dueFlashcards}</p>
                <p className="text-xs text-gray-500">Cards due</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{streak?.longestStreak ?? 0}</p>
                <p className="text-xs text-gray-500">Best streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-gray-700`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {label}
              </Link>
            ))}
            {dueFlashcards > 0 && (
              <Button asChild size="sm" className="rounded-xl">
                <Link href="/flashcards">Review {dueFlashcards} flashcard{dueFlashcards !== 1 ? "s" : ""}</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProgress.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No lessons completed yet. Start learning!</p>
              <Button className="mt-4" asChild>
                <Link href="/jlpt">Browse JLPT lessons</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              
              {recentProgress.map((p: { id: string; completedAt: Date | null; score?: number | null; lesson: { title: string } }) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.lesson.title}</p>
                    <p className="text-xs text-gray-400">
                      {p.completedAt
                        ? new Date(p.completedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  {p.score != null && (
                    <Badge variant={p.score >= 70 ? "default" : "secondary"}>
                      {p.score}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
