import { cn } from "@/lib/utils"

/**
 * Skeleton component
 * Used to show a placeholder while content is loading
 *
 * @example
 * // Basic usage
 * <Skeleton className="h-4 w-full" />
 *
 * @example
 * // For an avatar
 * <Skeleton className="h-12 w-12 rounded-full" />
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
