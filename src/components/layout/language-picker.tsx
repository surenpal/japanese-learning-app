"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE, LOCALES } from "@/lib/i18n-config";
import { cn } from "@/lib/utils";

interface Props {
  currentLocale: string;
}

export function LanguagePicker({ currentLocale }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? LOCALES.filter(
        (l) =>
          l.label.toLowerCase().includes(query.toLowerCase()) ||
          l.code.toLowerCase().includes(query.toLowerCase())
      )
    : LOCALES;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function selectLocale(code: string) {
    document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    setOpen(false);
    startTransition(() => {
      window.location.reload();
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        title="Change language"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
      >
        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language..."
              className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No language found.</p>
            )}
            {filtered.map((locale) => (
              <button
                key={locale.code}
                onClick={() => selectLocale(locale.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left",
                  locale.code === currentLocale
                    ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <span className="text-base">{locale.flag}</span>
                <span>{locale.label}</span>
                {locale.code === currentLocale && (
                  <span className="ml-auto text-xs text-red-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
