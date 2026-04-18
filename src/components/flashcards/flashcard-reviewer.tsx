"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CardItem = {
  id: string;
  vocabularyId?: string | null;
  kanjiId?: string | null;
  vocabulary?: {
    word: string;
    reading: string;
    meaning: string;
    example?: string | null;
  } | null;
  kanji?: {
    character: string;
    onyomi?: string | null;
    kunyomi?: string | null;
    meaning: string;
  } | null;
};

const QUALITY_LABELS = [
  { q: 0, label: "Blackout", color: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800" },
  { q: 2, label: "Hard", color: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-800" },
  { q: 3, label: "Good", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800" },
  { q: 5, label: "Easy", color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800" },
];

export function FlashcardReviewer({ cards }: { cards: CardItem[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const card = cards[index];

  async function handleQuality(quality: number) {
    await fetch("/api/flashcards/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id, quality }),
    });
    setFlipped(false);
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-4">
          <p className="text-5xl">🎉</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Session complete!</p>
          <p className="text-gray-500 dark:text-gray-400">You reviewed {cards.length} cards.</p>
          <Button onClick={() => router.refresh()}>Done</Button>
        </CardContent>
      </Card>
    );
  }

  const front = card.vocabulary
    ? card.vocabulary.word
    : card.kanji?.character ?? "?";

  const back = card.vocabulary ? (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 dark:text-gray-500">{card.vocabulary.reading}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.vocabulary.meaning}</p>
      {card.vocabulary.example && (
        <p className="text-sm bg-gray-50 dark:bg-gray-700 rounded p-2 text-gray-600 dark:text-gray-300">{card.vocabulary.example}</p>
      )}
    </div>
  ) : (
    <div className="space-y-1">
      <p className="text-gray-700 dark:text-gray-300">{card.kanji?.meaning}</p>
      {card.kanji?.onyomi && <p className="text-sm text-gray-400 dark:text-gray-500">音: {card.kanji.onyomi}</p>}
      {card.kanji?.kunyomi && <p className="text-sm text-gray-400 dark:text-gray-500">訓: {card.kanji.kunyomi}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-400 dark:text-gray-500">
        <span>{index + 1} / {cards.length}</span>
        <span>{cards.length - index - 1} remaining</span>
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative min-h-[260px] rounded-2xl border-2 cursor-pointer transition-all",
          flipped
            ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
        )}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          {!flipped ? (
            <>
              <p className={cn("font-bold text-gray-900 dark:text-gray-100", card.kanji ? "text-8xl" : "text-5xl")}>
                {front}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Tap to reveal</p>
            </>
          ) : (
            back
          )}
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {QUALITY_LABELS.map(({ q, label, color }) => (
            <button
              key={q}
              onClick={() => handleQuality(q)}
              className={cn("py-2 rounded-lg border text-sm font-medium transition-colors", color)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {!flipped && (
        <Button variant="secondary" className="w-full" onClick={() => setFlipped(true)}>
          Show answer
        </Button>
      )}
    </div>
  );
}
