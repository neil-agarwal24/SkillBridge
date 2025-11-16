import { AlertCircle, RefreshCcw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  title?: string
  message?: string
  onRetry?: () => void
  variant?: 'default' | 'destructive'
  className?: string
}

export function ErrorMessage({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  variant = 'default',
  className,
}: ErrorMessageProps) {
  const Icon = variant === 'destructive' ? XCircle : AlertCircle

  return (
    <div
      className={cn(
        'rounded-xl border p-6 text-center',
        variant === 'destructive'
          ? 'border-destructive/30 bg-destructive/10'
          : 'border-border bg-muted/50',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            'inline-flex p-3 rounded-full',
            variant === 'destructive' ? 'bg-destructive/20' : 'bg-muted'
          )}
        >
          <Icon
            className={cn(
              'w-6 h-6',
              variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
            )}
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
        </div>

        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="rounded-full">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
