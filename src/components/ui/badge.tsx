import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white border-transparent",
        secondary: "bg-gray-100 text-gray-800 border-transparent",
        outline: "text-gray-700 border-gray-200",
        N5: "bg-green-100 text-green-800 border-green-200",
        N4: "bg-blue-100 text-blue-800 border-blue-200",
        N3: "bg-yellow-100 text-yellow-800 border-yellow-200",
        N2: "bg-orange-100 text-orange-800 border-orange-200",
        N1: "bg-red-100 text-red-800 border-red-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
