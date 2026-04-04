"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function CompleteLessonButton({ lessonId, done }: { lessonId: string; done: boolean }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(done);
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: true }),
    });
    setCompleted(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button onClick={handleComplete} disabled={loading || completed} variant={completed ? "secondary" : "default"}>
      <CheckCircle className="w-4 h-4" />
      {completed ? "Completed" : loading ? "Saving..." : "Mark as complete"}
    </Button>
  );
}
