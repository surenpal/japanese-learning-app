import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  // Build contents — only include actual user/assistant exchanges (skip the UI welcome message)
  // Gemini requires alternating user/model turns starting with user
  const contents = messages
    .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
    .map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  // Ensure it starts with a user turn
  const firstUserIdx = contents.findIndex((c: { role: string }) => c.role === "user");
  const trimmedContents = firstUserIdx >= 0 ? contents.slice(firstUserIdx) : contents;

  try {
    const result = await model.generateContent({ contents: trimmedContents });
    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Gemini error:", err);
    const message = err instanceof Error ? err.message : String(err);
    // Surface rate limit specifically
    if (message.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit reached — please wait a moment and try again." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key?.length ?? 0,
    keyStart: key?.slice(0, 8) ?? "missing",
  });
}
