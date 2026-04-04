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
    desc: "JFT grammar patterns and sentence structures used in everyday work situations.",
    href: "/jft/grammar",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    desc: "Essential vocabulary for the JFT exam covering workplace and daily life topics.",
    href: "/jft/vocabulary",
  },
  {
    id: "kanji",
    label: "Kanji",
    icon: Grid3x3,
    color: "bg-green-50 text-green-600",
    desc: "Kanji characters commonly tested in the JFT, with readings and usage examples.",
    href: "/jft/kanji",
  },
  {
    id: "practice",
    label: "Practice Exam",
    icon: TestTube,
    color: "bg-purple-50 text-purple-600",
    desc: "Full-length practice tests with sample questions aligned to the official JFT format.",
    href: "/jft/practice",
  },
];

export default function JFTPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">JFT — Japan Foundation Test</h1>
          <p className="text-sm text-gray-500 mt-1">
            Japanese language test for specified skilled workers (特定技能)
          </p>
        </div>
        <Badge variant="default">A2 Level</Badge>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>About JFT-Basic:</strong> The Japan Foundation Test for Basic Japanese measures
        Japanese ability needed for daily life in Japan. Aimed at those seeking specified skilled
        worker status. Based on the{" "}
        <a
          href="https://www.irodori.jpf.go.jp"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Irodori curriculum
        </a>
        .
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

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Official JFT Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              { name: "Japan Foundation", url: "https://www.jpf.go.jp" },
              { name: "Minato", url: "https://minato-jf.jp" },
              { name: "Irodori", url: "https://www.irodori.jpf.go.jp" },
            ].map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
              >
                {r.name} ↗
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
