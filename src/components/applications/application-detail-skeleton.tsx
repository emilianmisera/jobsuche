export function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-6 p-6 pt-16" aria-busy="true" aria-label="Wird geladen">
      <div className="space-y-3">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}