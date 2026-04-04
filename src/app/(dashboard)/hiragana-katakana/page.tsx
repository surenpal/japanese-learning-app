import { prisma } from "@/lib/db";
import { KanaTrainer } from "@/components/kana/kana-trainer";

export default async function HiraganaKatakanaPage() {
  const [hiragana, katakana] = await Promise.all([
    prisma.kanaItem.findMany({ where: { type: "HIRAGANA" }, orderBy: { order: "asc" } }),
    prisma.kanaItem.findMany({ where: { type: "KATAKANA" }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiragana & Katakana</h1>
        <p className="text-sm text-gray-500 mt-1">
          Master both Japanese syllabaries — inspired by{" "}
          <a href="https://www.tofugu.com/japanese/learn-hiragana/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
            Tofugu's method
          </a>
        </p>
      </div>
      <KanaTrainer hiragana={hiragana} katakana={katakana} />
    </div>
  );
}
