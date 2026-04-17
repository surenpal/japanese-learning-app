"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Menu, User } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Mobile menu */}
      <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(!open)}>
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Title (mobile) */}
      <Link href="/dashboard" className="md:hidden font-bold text-gray-900 dark:text-gray-100">
        🇯🇵 Nihongo
      </Link>

      {/* Search placeholder */}
      <div className="hidden md:flex flex-1 max-w-md">
        <input
          className="w-full px-4 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Search lessons, kanji, vocabulary..."
        />
      </div>

      {/* User */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <User className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="font-medium">{user?.name ?? user?.email ?? "User"}</span>
        </div>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>
    </header>
  );
}
