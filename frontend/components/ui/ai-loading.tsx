"use client"

import { cn } from '@/lib/utils'

interface AILoadingProps {
  className?: string
  lines?: number
}

export function AILoading({ className, lines = 2 }: AILoadingProps) {
  return (
    <div className={cn("space-y-2 animate-pulse", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded animate-shimmer"
          style={{
            width: i === lines - 1 ? '75%' : '100%',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

interface AISkeletonCardProps {
  className?: string
}

export function AISkeletonCard({ className }: AISkeletonCardProps) {
  return (
    <div className={cn("p-4 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <AILoading lines={2} />
    </div>
  )
}
