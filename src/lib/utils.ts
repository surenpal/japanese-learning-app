import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type JLPTLevel = (typeof JLPT_LEVELS)[number];

export const LEVEL_COLORS: Record<JLPTLevel, string> = {
  N5: "bg-green-100 text-green-800 border-green-200",
  N4: "bg-blue-100 text-blue-800 border-blue-200",
  N3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  N2: "bg-orange-100 text-orange-800 border-orange-200",
  N1: "bg-red-100 text-red-800 border-red-200",
};

export const LEVEL_DESCRIPTIONS: Record<JLPTLevel, string> = {
  N5: "Beginner – ~800 vocab, ~100 kanji",
  N4: "Elementary – ~1,500 vocab, ~300 kanji",
  N3: "Intermediate – ~3,750 vocab, ~650 kanji",
  N2: "Upper-Intermediate – ~6,000 vocab, ~1,000 kanji",
  N1: "Advanced – ~10,000 vocab, ~2,000 kanji",
};

// SM-2 spaced repetition algorithm
export function sm2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  if (quality < 3) {
    return { repetitions: 0, interval: 1, easeFactor };
  }
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );
  const newRepetitions = repetitions + 1;
  let newInterval: number;
  if (newRepetitions === 1) newInterval = 1;
  else if (newRepetitions === 2) newInterval = 6;
  else newInterval = Math.round(interval * newEaseFactor);

  return { repetitions: newRepetitions, interval: newInterval, easeFactor: newEaseFactor };
}
