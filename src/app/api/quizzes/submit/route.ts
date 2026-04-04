import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user!.id as string;
  const { examType, level, contentType, score, total, timeTaken, answers } = await req.json();

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      examType,
      level: level ?? null,
      contentType,
      score,
      total,
      timeTaken: timeTaken ?? null,
      questions: {
        create: answers.map((a: { questionId: string; selected: string; correct: boolean }) => ({
          questionId: a.questionId,
          selectedAnswer: a.selected,
          isCorrect: a.correct,
        })),
      },
    },
  });

  return NextResponse.json({ id: attempt.id });
}
