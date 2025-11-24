"use client"

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIBadgeProps {
  text: string
  variant?: 'success' | 'fallback' | 'unavailable'
  className?: string
}

export function AIBadge({ text, variant = 'success', className }: AIBadgeProps) {
  const variantStyles = {
    success: 'from-purple-500/10 to-blue-500/10 border-purple-500/20 text-foreground/80',
    fallback: 'from-gray-500/10 to-gray-600/10 border-gray-500/20 text-foreground/60',
    unavailable: 'from-orange-500/10 to-red-500/10 border-orange-500/20 text-foreground/60'
  }

  const iconColors = {
    success: 'text-purple-500',
    fallback: 'text-gray-500',
    unavailable: 'text-orange-500'
  }

  return (
    <div 
      className={cn(
        "flex items-start gap-2 p-2 rounded-lg bg-gradient-to-r border",
        variantStyles[variant],
        className
      )}
      title={variant === 'success' ? 'Powered by Gemini AI' : variant === 'fallback' ? 'Standard match' : 'AI temporarily unavailable'}
    >
      <Sparkles size={14} className={cn("flex-shrink-0 mt-0.5", iconColors[variant])} />
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  )
}
