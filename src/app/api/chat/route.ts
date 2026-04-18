import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@/lib/auth";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Sensei (先生), a friendly AI Japanese language learning assistant embedded in Nihongo Master, a Japanese learning app.

Your capabilities:
1. Translate any language to Japanese — always show: Japanese text, reading in (hiragana/romaji), and meaning
2. Check Japanese grammar — show the corrected version and explain what was wrong
3. Explain kanji and vocabulary — show character, readings (on-yomi/kun-yomi), meaning, and an example sentence
4. Have natural conversations to help users practice Japanese
5. Answer questions about Japanese culture and the JLPT/JFT exams

Formatting rules:
- Wrap key Japanese words/kanji in 【】 brackets so users can click them for details. Example: 【食べる】means "to eat"
- Keep responses concise and friendly — this is a chat interface, not an essay
- Use encouraging language — learning Japanese is hard, celebrate small wins
- For translations, always include romaji for beginners
- When correcting grammar, be gentle and constructive`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json();

  // Build message history — skip the UI welcome message, start from first user message
  const allMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const firstUserIdx = allMessages.findIndex((m: { role: string }) => m.role === "user");
  const trimmed = firstUserIdx >= 0 ? allMessages.slice(firstUserIdx) : allMessages;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content ?? "Sorry, I could not generate a response.";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Groq error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const key = process.env.GROQ_API_KEY;
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key?.length ?? 0,
    keyStart: key?.slice(0, 8) ?? "missing",
  });
}
