"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

type Question = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string | null;
};

interface Props {
  questions: Question[];
  examType: string;
  level?: string;
  contentType: string;
}

const OPTIONS = ["A", "B", "C", "D"] as const;

export function QuizClient({ questions, examType, level, contentType }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: string; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const router = useRouter();

  const q = questions[index];
  const optionMap: Record<string, string> = {
    A: q.optionA,
    B: q.optionB,
    C: q.optionC,
    D: q.optionD,
  };

  function handleSelect(opt: string) {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setAnswers((prev) => [
      ...prev,
      { questionId: q.id, selected: opt, correct: opt === q.correctAnswer },
    ]);
  }

  async function handleNext() {
    if (index + 1 >= questions.length) {
      const score = answers.filter((a) => a.correct).length + (selected === q.correctAnswer ? 0 : 0);
      const finalScore = answers.filter((a) => a.correct).length;
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType,
          level,
          contentType,
          score: finalScore,
          total: questions.length,
          timeTaken,
          answers,
        }),
      });
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  if (done) {
    const score = answers.filter((a) => a.correct).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-6xl">{pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "📚"}</p>
          <p className="text-3xl font-bold text-gray-900">
            {score} / {questions.length}
          </p>
          <p className="text-gray-500">
            {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good work!" : "Keep practising!"}
          </p>
          <Progress value={pct} className="max-w-xs mx-auto" />
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={() => router.refresh()}>Try again</Button>
            <Button variant="secondary" onClick={() => router.push("/quizzes")}>
              Back to quizzes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Question {index + 1} of {questions.length}</span>
          <span>{answers.filter((a) => a.correct).length} correct</span>
        </div>
        <Progress value={((index) / questions.length) * 100} />
      </div>

      {/* Question */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-lg font-semibold text-gray-900 mb-6">{q.question}</p>
          <div className="space-y-3">
            {OPTIONS.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === q.correctAnswer;
              const showResult = answered;

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={answered}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all",
                    !showResult && "hover:border-gray-300 hover:bg-gray-50 border-gray-200 bg-white",
                    showResult && isCorrect && "border-green-400 bg-green-50 text-green-800",
                    showResult && isSelected && !isCorrect && "border-red-400 bg-red-50 text-red-800",
                    showResult && !isSelected && !isCorrect && "border-gray-100 bg-white text-gray-400"
                  )}
                >
                  <span className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold",
                    showResult && isCorrect ? "border-green-400 bg-green-100 text-green-700" :
                    showResult && isSelected && !isCorrect ? "border-red-400 bg-red-100 text-red-700" :
                    "border-gray-200 bg-gray-50 text-gray-500"
                  )}>
                    {opt}
                  </span>
                  <span className="flex-1">{optionMap[opt]}</span>
                  {showResult && isCorrect && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && q.explanation && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}

          {answered && (
            <Button className="w-full mt-5" onClick={handleNext}>
              {index + 1 >= questions.length ? "See results" : "Next question →"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
