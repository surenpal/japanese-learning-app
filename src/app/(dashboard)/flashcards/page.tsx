import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FlashcardReviewer } from "@/components/flashcards/flashcard-reviewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brain, Plus } from "lucide-react";

export default async function FlashcardsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const dueCards = await prisma.flashcardSRS.findMany({
    where: { userId, nextReviewAt: { lte: new Date() } },
    include: { vocabulary: true, kanji: true },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
  });

  const totalCards = await prisma.flashcardSRS.count({ where: { userId } });
  const upcomingCount = await prisma.flashcardSRS.count({
    where: { userId, nextReviewAt: { gt: new Date() } },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-sm text-gray-500 mt-1">
            Spaced repetition (SM-2) — inspired by{" "}
            <a href="https://apps.ankiweb.net" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
              Anki
            </a>
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/jlpt">
            <Plus className="w-4 h-4" />
            Add cards
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-red-600">{dueCards.length}</p>
            <p className="text-xs text-gray-500 mt-1">Due now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-gray-700">{upcomingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-gray-700">{totalCards}</p>
            <p className="text-xs text-gray-500 mt-1">Total cards</p>
          </CardContent>
        </Card>
      </div>

      {dueCards.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Brain className="w-12 h-12 mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No cards due right now!</p>
            <p className="text-sm text-gray-400 mt-1">
              {totalCards === 0
                ? "Study some lessons first, then add vocabulary or kanji as flashcards."
                : "Come back later — your next review will be scheduled automatically."}
            </p>
            {totalCards === 0 && (
              <Button className="mt-4" asChild>
                <Link href="/jlpt">Browse JLPT lessons</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <FlashcardReviewer cards={dueCards} />
      )}
    </div>
  );
}
