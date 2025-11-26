"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Heart, Shield, Accessibility, CloudRain, HelpCircle, AlertTriangle, X, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmergencyNotificationProps {
  emergency: {
    emergencyId: string
    type: string
    severity: number
    description: string
    distance: number
    reasons: string[]
    requester: {
      name: string
      profilePicture?: string
    }
  }
  onRespond: (emergencyId: string) => void
  onDismiss: (emergencyId: string) => void
}

const EMERGENCY_ICONS = {
  medical: Heart,
  safety: Shield,
  accessibility: Accessibility,
  disaster: CloudRain,
  other: HelpCircle
}

const EMERGENCY_COLORS = {
  medical: 'bg-red-600 border-red-700',
  safety: 'bg-orange-600 border-orange-700',
  accessibility: 'bg-blue-600 border-blue-700',
  disaster: 'bg-purple-600 border-purple-700',
  other: 'bg-gray-600 border-gray-700'
}

export function EmergencyNotification({
  emergency,
  onRespond,
  onDismiss
}: EmergencyNotificationProps) {
  const [dismissed, setDismissed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes

  const Icon = EMERGENCY_ICONS[emergency.type as keyof typeof EMERGENCY_ICONS] || AlertTriangle
  const colorClass = EMERGENCY_COLORS[emergency.type as keyof typeof EMERGENCY_COLORS] || 'bg-red-600 border-red-700'

  // Auto-dismiss after 2 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Play sound and vibrate on mount
  useEffect(() => {
    // Play alert sound (browser beep)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmm98OSmUhENT6Ln77RnHwU7k9n0yoQyBSF+zPLaizsIGGS68eeXTQ4PWKzn8bllHwU8ktj1yo81Byp/zPPajT0HH225');
    audio.play().catch(() => {
      // Silently fail if audio not allowed
    })

    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }

    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 Emergency Alert', {
        body: `${emergency.requester.name} needs help: ${emergency.description.substring(0, 100)}`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: emergency.emergencyId,
        requireInteraction: true
      })
    }
  }, [])

  const handleRespond = () => {
    onRespond(emergency.emergencyId)
    setDismissed(true)
  }

  const handleDismiss = () => {
    onDismiss(emergency.emergencyId)
    setDismissed(true)
  }

  if (dismissed) return null

  const distanceText = emergency.distance < 1 
    ? `${Math.round(emergency.distance * 1000)}m away`
    : `${emergency.distance.toFixed(1)} km away`

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top duration-300">
      <Alert className={cn(
        'border-4 shadow-2xl',
        colorClass
      )}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 bg-white rounded-full p-3">
            <Icon className={cn('h-8 w-8', `text-${emergency.type === 'medical' ? 'red' : emergency.type === 'safety' ? 'orange' : emergency.type === 'accessibility' ? 'blue' : emergency.type === 'disaster' ? 'purple' : 'gray'}-600`)} />
          </div>

          {/* Content */}
          <div className="flex-1 text-white space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  🚨 EMERGENCY ALERT
                  {emergency.severity >= 4 && (
                    <span className="text-xs bg-white text-red-600 px-2 py-1 rounded-full font-bold">
                      CRITICAL
                    </span>
                  )}
                </h3>
                <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                  <Navigation className="h-3 w-3" />
                  {distanceText} • {emergency.requester.name} needs help
                </p>
              </div>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-base font-medium leading-relaxed">
              {emergency.description}
            </p>

            {/* Reasons */}
            {emergency.reasons && emergency.reasons.length > 0 && (
              <div className="text-sm opacity-90 space-y-1">
                <p className="font-semibold">Why you're matched:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {emergency.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timer */}
            <p className="text-xs opacity-75">
              This alert will auto-dismiss in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleRespond}
                size="lg"
                className="flex-1 bg-white text-red-600 hover:bg-gray-100 font-bold text-lg h-14"
              >
                <Heart className="mr-2 h-5 w-5" />
                Respond Now
              </Button>
              <Button
                onClick={handleDismiss}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                Can't Help
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  )
}
