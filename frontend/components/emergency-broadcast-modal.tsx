"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heart, Shield, Accessibility, CloudRain, HelpCircle, AlertTriangle, Loader2, PhoneCall } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmergencyBroadcastModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (emergency: EmergencyData) => Promise<void>
  currentUserId: string
}

interface EmergencyData {
  type: string
  severity: number
  description: string
  requesterId: string
}

const EMERGENCY_TYPES = [
  {
    id: 'medical',
    label: 'Medical',
    icon: Heart,
    color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200',
    activeColor: 'bg-red-600 text-white border-red-600'
  },
  {
    id: 'safety',
    label: 'Safety',
    icon: Shield,
    color: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200',
    activeColor: 'bg-orange-600 text-white border-orange-600'
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Accessibility,
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600'
  },
  {
    id: 'disaster',
    label: 'Disaster',
    icon: CloudRain,
    color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
    activeColor: 'bg-purple-600 text-white border-purple-600'
  },
  {
    id: 'other',
    label: 'Other',
    icon: HelpCircle,
    color: 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200',
    activeColor: 'bg-gray-600 text-white border-gray-600'
  }
]

const SEVERITY_DESCRIPTIONS = [
  'Minor issue (e.g., locked out)',
  'Need assistance (e.g., fell, need help up)',
  'Urgent situation (e.g., injury, scared)',
  'Serious emergency (e.g., medical crisis)',
  'Critical - life threatening'
]

export function EmergencyBroadcastModal({
  open,
  onOpenChange,
  onSubmit,
  currentUserId
}: EmergencyBroadcastModalProps) {
  const [type, setType] = useState<string>('')
  const [severity, setSeverity] = useState<number>(3)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Debug: Log when modal opens
  useEffect(() => {
    if (open) {
      console.log('Emergency modal opened with currentUserId:', currentUserId)
    }
  }, [open, currentUserId])

  const handleSubmit = async () => {
    // Validation
    if (!type) {
      setError('Please select an emergency type')
      return
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters)')
      return
    }

    // Ensure we have a user ID
    let userId = currentUserId
    if (!userId) {
      userId = localStorage.getItem('neighbornet_user_id') || '1'
      if (!localStorage.getItem('neighbornet_user_id')) {
        localStorage.setItem('neighbornet_user_id', '1')
      }
    }

    if (!userId) {
      setError('User ID not found. Please refresh the page.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      console.log('Sending emergency:', { type, severity, description: description.trim(), requesterId: userId })
      
      await onSubmit({
        type,
        severity,
        description: description.trim(),
        requesterId: userId
      })

      // Reset form
      setType('')
      setSeverity(3)
      setDescription('')
      setShowConfirmation(false)
      onOpenChange(false)
    } catch (err: any) {
      console.error('Emergency broadcast error:', err)
      setError(err.message || err.toString() || 'Failed to send emergency broadcast. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setType('')
      setSeverity(3)
      setDescription('')
      setError(null)
      setShowConfirmation(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Emergency Broadcast
              </DialogTitle>
              <DialogDescription>
                Send an emergency alert to nearby neighbors who can help. Your location will only be shared with those who respond.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Emergency Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">What type of emergency? *</label>
                <div className="grid grid-cols-2 gap-3">
                  {EMERGENCY_TYPES.map((emergencyType) => {
                    const Icon = emergencyType.icon
                    const isSelected = type === emergencyType.id

                    return (
                      <button
                        key={emergencyType.id}
                        type="button"
                        onClick={() => setType(emergencyType.id)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                          isSelected ? emergencyType.activeColor : emergencyType.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{emergencyType.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Severity Slider */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>How urgent? *</span>
                  <span className={cn(
                    'text-sm font-bold',
                    severity >= 4 ? 'text-red-600' : severity >= 3 ? 'text-orange-600' : 'text-yellow-600'
                  )}>
                    {severity}/5 - {SEVERITY_DESCRIPTIONS[severity - 1]}
                  </span>
                </label>
                <Slider
                  value={[severity]}
                  onValueChange={(value) => setSeverity(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minor</span>
                  <span>Critical</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  What's happening? * ({description.length}/1000)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                  placeholder="Describe your emergency in detail. This helps neighbors understand how to help you. Include your location if needed (e.g., apartment number, building entrance)."
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                />
              </div>

              {/* 911 Reminder */}
              {severity >= 4 && (
                <Alert variant="destructive">
                  <PhoneCall className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Critical emergency detected.</strong> If this is life-threatening, call 911 immediately. Neighbors can provide support while you wait for emergency services.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirmation(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading || !type || !description.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Emergency Broadcast'
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirm Emergency Broadcast</DialogTitle>
              <DialogDescription>
                This will send an urgent notification to nearby neighbors who can help.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-900">
                    {EMERGENCY_TYPES.find(t => t.id === type)?.label} Emergency
                  </span>
                  <span className="ml-auto text-sm font-medium text-red-600">
                    Severity: {severity}/5
                  </span>
                </div>
                <p className="text-sm text-red-800">{description}</p>
              </div>

              <p className="text-sm text-gray-600">
                By confirming, you're sending an emergency alert to {' '}
                <strong>5-10 nearby neighbors</strong> with relevant skills who can help.
                Your exact location will only be shared with those who respond.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    'Confirm & Send'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
