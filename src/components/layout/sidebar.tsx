"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Brain,
  FileText,
  Flame,
  Home,
  LayoutGrid,
  Star,
  TrendingUp,
  Type,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/jlpt", label: "JLPT (N5–N1)", icon: BookOpen },
  { href: "/jft", label: "JFT", icon: Star },
  { href: "/skill-test", label: "Skills Test", icon: FileText },
  { href: "/hiragana-katakana", label: "Hiragana / Katakana", icon: Type },
  { href: "/flashcards", label: "Flashcards", icon: Brain },
  { href: "/quizzes", label: "Quizzes", icon: LayoutGrid },
  { href: "/progress", label: "My Progress", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 py-6 px-3 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-6">
        <span className="text-2xl">🇯🇵</span>
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Nihongo</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Master Japanese</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-red-600 dark:text-red-400" : "text-gray-400 dark:text-gray-500")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Streak footer */}
      <div className="mt-auto px-3 py-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-100 dark:border-orange-900">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Daily Streak</span>
        </div>
        <p className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">Keep studying every day!</p>
      </div>
    </aside>
  );
}
