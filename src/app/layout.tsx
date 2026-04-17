import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nihongo Master – Learn Japanese for JLPT, JFT & Skills Test",
  description:
    "Master Japanese with structured lessons, flashcards, and quizzes for JLPT N5–N1, JFT, and Skills Test exams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
