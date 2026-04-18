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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Learner"} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/60", value: streak?.currentStreak ?? 0, label: "Day streak" },
          { icon: BookOpen, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/60", value: totalCompleted, label: "Lessons done" },
          { icon: Brain, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/60", value: dueFlashcards, label: "Cards due" },
          { icon: Flame, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/60", value: streak?.longestStreak ?? 0, label: "Best streak" },
        ].map(({ icon: Icon, color, bg, value, label }) => (
          <Card key={label} className="hover:shadow-md transition-all duration-200">
            <CardContent className="pt-5 pb-5">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick start */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Start</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} dark:opacity-90`}>
                <Icon className="w-5 h-5" />
              </div>
              {label}
            </Link>
          ))}
        </div>
        {dueFlashcards > 0 && (
          <Button asChild className="mt-3 rounded-xl w-full sm:w-auto">
            <Link href="/flashcards">Review {dueFlashcards} flashcard{dueFlashcards !== 1 ? "s" : ""} due</Link>
          </Button>
        )}
      </div>

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
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.lesson.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
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
