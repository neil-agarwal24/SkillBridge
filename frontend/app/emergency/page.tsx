"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmergencyBroadcastModal } from '@/components/emergency-broadcast-modal'
import { emergencyAPI } from '@/lib/api'
import { AlertTriangle, Clock, MapPin, Users, Heart, Shield, Accessibility, CloudRain, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMERGENCY_ICONS = {
  medical: Heart,
  safety: Shield,
  accessibility: Accessibility,
  disaster: CloudRain,
  other: HelpCircle
}

export default function EmergencyPage() {
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [activeEmergencies, setActiveEmergencies] = useState<any[]>([])
  const [myHistory, setMyHistory] = useState<any>({ asRequester: [], asResponder: [] })
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    // Get user ID from localStorage, default to '1' for demo
    const userId = localStorage.getItem('neighbornet_user_id') || '1'
    // Save it back if it wasn't set
    if (!localStorage.getItem('neighbornet_user_id')) {
      localStorage.setItem('neighbornet_user_id', '1')
    }
    setCurrentUserId(userId)
    loadData(userId)
  }, [])

  const loadData = async (userId: string) => {
    try {
      setLoading(true)
      const [active, history] = await Promise.all([
        emergencyAPI.getActiveEmergencies(),
        emergencyAPI.getEmergencyHistory(userId)
      ])
      
      if (active.success) {
        setActiveEmergencies(active.emergencies || [])
      }
      
      if (history.success) {
        setMyHistory({
          asRequester: history.asRequester || [],
          asResponder: history.asResponder || []
        })
      }
    } catch (error) {
      console.error('Failed to load emergency data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmergency = async (emergencyData: any) => {
    try {
      console.log('Creating emergency with data:', emergencyData)
      const response = await emergencyAPI.createEmergency(emergencyData)
      console.log('Emergency API response:', response)
      
      if (response.success) {
        // Show success message
        alert(`Emergency broadcast sent to ${response.matches?.length || 0} neighbors!`)
        
        // Reload data
        loadData(currentUserId)
      } else {
        throw new Error(response.error || 'Emergency broadcast failed')
      }
    } catch (error: any) {
      console.error('Create emergency error:', error)
      // Re-throw with more details
      const errorMsg = error.data?.error || error.message || 'Failed to create emergency'
      throw new Error(errorMsg)
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60)
    
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Emergency Response</h1>
          <p className="text-gray-600">
            Broadcast emergencies to nearby neighbors who can help
          </p>
        </div>
        <Button
          onClick={() => {
            // Ensure we have a user ID before opening modal
            if (!currentUserId) {
              const userId = localStorage.getItem('neighbornet_user_id') || '1'
              localStorage.setItem('neighbornet_user_id', userId)
              setCurrentUserId(userId)
            }
            setShowBroadcastModal(true)
          }}
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white font-bold"
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          Create Emergency
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Emergencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeEmergencies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Times You've Helped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myHistory.asResponder.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Times You've Asked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myHistory.asRequester.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Emergencies */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Emergencies Nearby</CardTitle>
          <CardDescription>
            {activeEmergencies.length === 0 
              ? 'No active emergencies right now' 
              : `${activeEmergencies.length} neighbor(s) need help`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : activeEmergencies.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              All clear! No emergencies in your area.
            </p>
          ) : (
            <div className="space-y-4">
              {activeEmergencies.map((emergency) => {
                const Icon = EMERGENCY_ICONS[emergency.type as keyof typeof EMERGENCY_ICONS] || HelpCircle
                
                return (
                  <div
                    key={emergency._id}
                    className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <Icon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold capitalize">{emergency.type} Emergency</h3>
                            <Badge variant="destructive">{emergency.severity}/5</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {emergency.requester?.name || 'Unknown'} • {formatTime(emergency.createdAt)}
                          </p>
                        </div>
                      </div>
                      {emergency.responders && emergency.responders.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {emergency.responders.length} responding
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-3">
                      {emergency.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="capitalize">{emergency.status}</span>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Times You Helped */}
        <Card>
          <CardHeader>
            <CardTitle>Times You've Helped</CardTitle>
            <CardDescription>
              {myHistory.asResponder.length} emergencies responded to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myHistory.asResponder.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No response history yet
              </p>
            ) : (
              <div className="space-y-3">
                {myHistory.asResponder.slice(0, 5).map((emergency: any) => {
                  const Icon = EMERGENCY_ICONS[emergency.type as keyof typeof EMERGENCY_ICONS] || HelpCircle
                  
                  return (
                    <div key={emergency._id} className="flex items-center gap-3 text-sm">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium capitalize">{emergency.type}</p>
                        <p className="text-gray-500">{formatTime(emergency.createdAt)}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{emergency.status}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Times You Asked */}
        <Card>
          <CardHeader>
            <CardTitle>Times You've Asked for Help</CardTitle>
            <CardDescription>
              {myHistory.asRequester.length} emergencies created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myHistory.asRequester.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No emergency requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {myHistory.asRequester.slice(0, 5).map((emergency: any) => {
                  const Icon = EMERGENCY_ICONS[emergency.type as keyof typeof EMERGENCY_ICONS] || HelpCircle
                  
                  return (
                    <div key={emergency._id} className="flex items-center gap-3 text-sm">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium capitalize">{emergency.type}</p>
                        <p className="text-gray-500">{formatTime(emergency.createdAt)}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{emergency.status}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Broadcast Modal */}
      <EmergencyBroadcastModal
        open={showBroadcastModal}
        onOpenChange={setShowBroadcastModal}
        onSubmit={handleCreateEmergency}
        currentUserId={currentUserId}
      />
    </div>
  )
}
