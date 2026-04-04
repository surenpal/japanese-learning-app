"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-100", className)}
      {...props}
    >
      <div
        className="h-full bg-red-600 transition-all duration-300"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
