import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sm2 } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId, quality } = await req.json();

  const card = await prisma.flashcardSRS.findUnique({ where: { id: cardId } });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const { repetitions, interval, easeFactor } = sm2(
    quality,
    card.repetitions,
    card.easeFactor,
    card.interval
  );

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  const updated = await prisma.flashcardSRS.update({
    where: { id: cardId },
    data: { repetitions, interval, easeFactor, nextReviewAt, lastReviewedAt: new Date() },
  });

  return NextResponse.json(updated);
}
