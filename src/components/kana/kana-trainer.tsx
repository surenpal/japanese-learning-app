"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KanaItem = { id: string; character: string; romaji: string; group: string; type: string };

interface Props {
  hiragana: KanaItem[];
  katakana: KanaItem[];
}

type Mode = "learn" | "quiz";

export function KanaTrainer({ hiragana, katakana }: Props) {
  const [tab, setTab] = useState<"hiragana" | "katakana">("hiragana");
  const [mode, setMode] = useState<Mode>("learn");
  const [quizIndex, setQuizIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const items = tab === "hiragana" ? hiragana : katakana;

  // Group by "group" field
  const groups = items.reduce<Record<string, KanaItem[]>>((acc, k) => {
    if (!acc[k.group]) acc[k.group] = [];
    acc[k.group].push(k);
    return acc;
  }, {});

  function startQuiz() {
    setMode("quiz");
    setQuizIndex(0);
    setInput("");
    setResult(null);
    setScore(0);
    setQuizDone(false);
  }

  function checkAnswer() {
    if (!items[quizIndex]) return;
    const correct = input.trim().toLowerCase() === items[quizIndex].romaji.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setResult(null);
      setInput("");
      if (quizIndex + 1 >= items.length) {
        setQuizDone(true);
      } else {
        setQuizIndex((i) => i + 1);
      }
    }, 800);
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "hiragana" ? "default" : "secondary"}
          onClick={() => { setTab("hiragana"); setMode("learn"); }}
        >
          Hiragana (ひらがな)
        </Button>
        <Button
          variant={tab === "katakana" ? "default" : "secondary"}
          onClick={() => { setTab("katakana"); setMode("learn"); }}
        >
          Katakana (カタカナ)
        </Button>
      </div>

      {mode === "learn" ? (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{items.length} characters</p>
            <Button onClick={startQuiz} variant="outline">
              Quiz yourself →
            </Button>
          </div>

          {Object.entries(groups).map(([group, chars]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {group}
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {chars.map((k) => (
                  <div
                    key={k.id}
                    className="flex flex-col items-center p-2 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-default"
                  >
                    <span className="text-2xl font-bold text-gray-900">{k.character}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{k.romaji}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {quizDone ? (
              <>
                <p className="text-4xl font-bold text-gray-900">
                  {score} / {items.length}
                </p>
                <p className="text-gray-500">
                  {score === items.length
                    ? "Perfect! 🎉"
                    : score >= items.length * 0.8
                    ? "Great job!"
                    : "Keep practising!"}
                </p>
                <Button onClick={() => setMode("learn")}>Back to study</Button>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {tab} quiz — {quizIndex + 1} / {items.length}
                </p>
                <p className="text-8xl font-bold text-gray-900">{items[quizIndex]?.character}</p>
                <div className="flex gap-2">
                  <input
                    className={cn(
                      "flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-center",
                      result === "correct" && "border-green-400 bg-green-50",
                      result === "wrong" && "border-red-400 bg-red-50"
                    )}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !result && checkAnswer()}
                    placeholder="Type romaji..."
                    autoFocus
                    disabled={!!result}
                  />
                  <Button onClick={checkAnswer} disabled={!!result || !input}>
                    Check
                  </Button>
                </div>
                {result === "wrong" && (
                  <p className="text-sm text-red-600">
                    Correct: <strong>{items[quizIndex]?.romaji}</strong>
                  </p>
                )}
                <p className="text-xs text-gray-400">Score: {score}</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
