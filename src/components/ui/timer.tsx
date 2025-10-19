import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatTimeRemaining } from '../../lib/utils/reservations'

interface TimerProps {
  expiresAt: Date
  onExpire?: () => void
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'warning' | 'danger'
}

export function Timer({
  expiresAt,
  onExpire,
  className,
  showIcon = true,
  variant = 'default'
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    Math.max(0, expiresAt.getTime() - Date.now())
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt.getTime() - Date.now())
      setTimeRemaining(remaining)

      if (remaining === 0 && onExpire) {
        onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const minutes = Math.floor(timeRemaining / 60000)
  const isWarning = minutes <= 2 && minutes > 0
  const isDanger = minutes === 0

  const getVariantStyles = () => {
    if (variant === 'warning' || isWarning) {
      return 'text-orange-600 dark:text-orange-400'
    }
    if (variant === 'danger' || isDanger) {
      return 'text-red-600 dark:text-red-400'
    }
    return 'text-muted-foreground'
  }

  if (timeRemaining === 0) {
    return (
      <div className={cn(
        'flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400',
        className
      )}>
        {showIcon && <Clock className="h-4 w-4" />}
        <span>Expired</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex items-center gap-1 text-sm font-medium',
      getVariantStyles(),
      className
    )}>
      {showIcon && <Clock className="h-4 w-4" />}
      <span>{formatTimeRemaining(timeRemaining)}</span>
      {isWarning && (
        <span className="text-xs text-orange-600 dark:text-orange-400">
          (expires soon!)
        </span>
      )}
    </div>
  )
}

interface CountdownProps {
  expiresAt: Date
  onExpire?: () => void
  className?: string
}

export function Countdown({ expiresAt, onExpire, className }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    Math.max(0, expiresAt.getTime() - Date.now())
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt.getTime() - Date.now())
      setTimeRemaining(remaining)

      if (remaining === 0 && onExpire) {
        onExpire()
      }
    }, 100) // Update more frequently for smooth animation

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const totalDuration = 15 * 60 * 1000 // 15 minutes in milliseconds
  const progress = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100))

  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  const getProgressColor = () => {
    if (progress > 50) return 'bg-green-500'
    if (progress > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (timeRemaining === 0) {
    return (
      <div className={cn('text-center p-4', className)}>
        <div className="text-red-600 dark:text-red-400 font-medium">
          Reservation Expired
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          This item is no longer reserved for you
        </div>
      </div>
    )
  }

  return (
    <div className={cn('p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Reserved for you</span>
        <span className="text-sm font-mono">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-200',
            getProgressColor()
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {minutes <= 2 && (
        <div className="text-xs text-orange-600 dark:text-orange-400 text-center">
          ⚠️ Reserved time expires soon! Complete your purchase quickly.
        </div>
      )}
    </div>
  )
}