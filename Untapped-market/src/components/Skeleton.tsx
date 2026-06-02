import { cn } from '@/lib/utils'

interface Props {
  className?: string
  /** Convenience: render N skeletons */
  count?: number
}

export default function Skeleton({ className, count = 1 }: Props) {
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className={className} />
        ))}
      </>
    )
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-[var(--surface2)]',
        className,
      )}
      style={{ borderRadius: 'var(--radius)' }}
    />
  )
}

/** Pre-shaped skeleton matching a StrainCard footprint */
export function StrainCardSkeleton() {
  return (
    <div className="strain-card" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}
