import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Grid3x3, TestTube } from "lucide-react";

const sections = [
  {
    id: "grammar",
    label: "Grammar",
    icon: FileText,
    color: "bg-red-50 text-red-600",
    desc: "Grammar patterns and sentence structures required for the Specified Skills exam.",
    href: "/skill-test/grammar",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    desc: "Industry-specific and general vocabulary commonly tested in the Skills Test.",
    href: "/skill-test/vocabulary",
  },
  {
    id: "kanji",
    label: "Kanji",
    icon: Grid3x3,
    color: "bg-green-50 text-green-600",
    desc: "Kanji used in workplace settings and official documents.",
    href: "/skill-test/kanji",
  },
  {
    id: "practice",
    label: "Practice Exam Sets",
    icon: TestTube,
    color: "bg-purple-50 text-purple-600",
    desc: "Multiple full-length practice exam sets with answer explanations.",
    href: "/skill-test/practice",
  },
];

const practiceSetCount = 5;

export default function SkillTestPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Skills Test — 特定技能評価試験
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Japanese language component of the Specified Skilled Worker evaluation
          </p>
        </div>
        <Badge variant="secondary">Specified Skills</Badge>
      </div>

      {/* Info banner */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
        <strong>About the Skills Test:</strong> The Specified Skills evaluation assesses both
        industry knowledge and Japanese language ability. Our practice sets follow the format used
        by{" "}
        <a
          href="https://www.jlptcheck.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          JLPT Check
        </a>{" "}
        and official government resources.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map(({ id, label, icon: Icon, color, desc, href }) => (
          <Card key={id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <CardTitle>{label}</CardTitle>
              <CardDescription>{desc}</CardDescription>
              {id === "practice" && (
                <Badge variant="secondary" className="w-fit mt-1">
                  {practiceSetCount} sets available
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant={id === "practice" ? "default" : "outline"}>
                <Link href={href}>
                  {id === "practice" ? "Start practice exam" : `Study ${label}`}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Practice exam sets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Practice Exam Sets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: practiceSetCount }, (_, i) => i + 1).map((n) => (
              <Button key={n} variant="outline" asChild>
                <Link href={`/quizzes?examType=SKILL_TEST&setNumber=${n}&isPracticeExam=true`}>
                  Set {n}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
