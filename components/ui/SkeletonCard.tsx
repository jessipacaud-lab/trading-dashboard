import { cn } from '@/lib/utils'

interface SkeletonProps { className?: string }

function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'rounded',
      'bg-gradient-to-r from-surface-700 via-surface-600 to-surface-700',
      'bg-[length:200%_100%] animate-skeleton',
      className
    )} />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface-900 border border-white/5 rounded-xl p-3 space-y-2', className)}>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-1 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-2.5', className)}>
      <Skeleton className="h-3 w-10 flex-shrink-0" />
      <Skeleton className="h-6 w-1 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-2.5 w-32" />
      </div>
    </div>
  )
}
