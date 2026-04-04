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
  { q: 0, label: "Blackout", color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" },
  { q: 2, label: "Hard", color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" },
  { q: 3, label: "Good", color: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200" },
  { q: 5, label: "Easy", color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" },
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
          <p className="text-xl font-bold text-gray-900">Session complete!</p>
          <p className="text-gray-500">You reviewed {cards.length} cards.</p>
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
      <p className="text-sm text-gray-400">{card.vocabulary.reading}</p>
      <p className="text-2xl font-bold text-gray-900">{card.vocabulary.meaning}</p>
      {card.vocabulary.example && (
        <p className="text-sm bg-gray-50 rounded p-2 text-gray-600">{card.vocabulary.example}</p>
      )}
    </div>
  ) : (
    <div className="space-y-1">
      <p className="text-gray-700">{card.kanji?.meaning}</p>
      {card.kanji?.onyomi && <p className="text-sm text-gray-400">音: {card.kanji.onyomi}</p>}
      {card.kanji?.kunyomi && <p className="text-sm text-gray-400">訓: {card.kanji.kunyomi}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-400">
        <span>{index + 1} / {cards.length}</span>
        <span>{cards.length - index - 1} remaining</span>
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative min-h-[260px] rounded-2xl border-2 cursor-pointer transition-all",
          flipped
            ? "border-red-200 bg-red-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        )}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          {!flipped ? (
            <>
              <p className={cn("font-bold text-gray-900", card.kanji ? "text-8xl" : "text-5xl")}>
                {front}
              </p>
              <p className="text-sm text-gray-400 mt-4">Tap to reveal</p>
            </>
          ) : (
            back
          )}
        </div>
      </div>

      {/* Rating buttons — only show when flipped */}
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
