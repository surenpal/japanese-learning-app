import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, FileText, Star, TrendingUp, Type } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "JLPT N5 – N1",
    desc: "Structured grammar, vocabulary, and kanji lessons for all five JLPT levels.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Star,
    title: "JFT Preparation",
    desc: "Lessons and sample tests aligned with the Japan Foundation Test format.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: FileText,
    title: "Skills Test",
    desc: "Practice exams and question sets for the Specified Skills exam.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Type,
    title: "Hiragana & Katakana",
    desc: "Learn and master both Japanese alphabets with interactive practice.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: Brain,
    title: "Flashcards (SRS)",
    desc: "Spaced repetition flashcards inspired by Anki to maximise retention.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    desc: "Track streaks, scores, and completion across every lesson and quiz.",
    color: "bg-orange-50 text-orange-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🇯🇵</span>
          <div>
            <p className="font-bold text-lg text-gray-900 leading-tight">Nihongo Master</p>
            <p className="text-xs text-gray-400">Learn Japanese for JLPT · JFT · Skills Test</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started free</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
          JLPT · JFT · Skills Test
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Master Japanese,{" "}
          <span className="text-red-600">one lesson at a time</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Structured lessons, spaced-repetition flashcards, and practice exams for every level —
          from beginner N5 all the way to advanced N1.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Start learning for free</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Everything you need to pass your exam
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reference sites */}
      <section className="bg-gray-50 border-t border-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-3">Inspired by the best Japanese learning resources</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {["JLPT Pro", "Tofugu", "TryJLPT", "Irodori", "JapaneseTest.org", "Anki"].map((s) => (
              <span key={s} className="px-3 py-1 rounded-full bg-white border border-gray-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Nihongo Master — Built for JLPT, JFT & Skills Test learners
      </footer>
    </div>
  );
}
