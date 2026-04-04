import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, completed, score } = await req.json();
  const userId = session.user!.id as string;

  const progress = await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      completed,
      score: score ?? undefined,
      completedAt: completed ? new Date() : undefined,
    },
    create: {
      userId,
      lessonId,
      completed,
      score: score ?? undefined,
      completedAt: completed ? new Date() : undefined,
    },
  });

  // Update streak
  await updateStreak(userId);

  return NextResponse.json(progress);
}

async function updateStreak(userId: string) {
  const streak = await prisma.streak.findUnique({ where: { userId } });
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!streak) {
    await prisma.streak.create({ data: { userId, currentStreak: 1, longestStreak: 1, lastStudiedAt: now } });
    return;
  }

  const lastStudied = streak.lastStudiedAt
    ? new Date(streak.lastStudiedAt.getFullYear(), streak.lastStudiedAt.getMonth(), streak.lastStudiedAt.getDate())
    : null;

  if (lastStudied && lastStudied.getTime() === today.getTime()) return; // already studied today

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isConsecutive = lastStudied && lastStudied.getTime() === yesterday.getTime();

  const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastStudiedAt: now,
    },
  });
}
