
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: // Use CSS variables for consistency with theme
          "border-transparent bg-[hsl(var(--success-background))] text-[hsl(var(--success))] dark:bg-[hsl(var(--success-background))] dark:text-[hsl(var(--success))] hover:bg-[hsl(var(--success-background))]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  // Ensure variant is not null or undefined before passing to cva
  const appliedVariant = variant ?? "default";
  return (
    <div className={cn(badgeVariants({ variant: appliedVariant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
