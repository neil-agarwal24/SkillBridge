'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Users, Heart, MapPin, Sparkles, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { userAPI } from '@/lib/api'

interface Neighbor {
  id: string
  name: string
  avatar: string
  tagline: string
  offers: string[]
  needs: string[]
  distance: number
  isNew: boolean
  type: string
  aiSuggestedMessage: string
  aiMatchReason?: string
}

export function NeighborsList({ filters, selectedNeighbor, onSelectNeighbor }: any) {
  const router = useRouter()
  const [likedNeighbors, setLikedNeighbors] = useState<string[]>([])
  const [showAIMessage, setShowAIMessage] = useState<string | null>(null)
  const [neighbors, setNeighbors] = useState<Neighbor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default location (Portland, OR)
  const DEFAULT_LAT = 45.5152
  const DEFAULT_LNG = -122.6784

  // Sort neighbors by relevance to current user's profile
  const sortByRelevance = async (neighbors: any[], userId: string | null) => {
    if (!userId) return neighbors

    try {
      // Get current user's profile
      const userResponse = await userAPI.getUser(userId)
      const currentUser = userResponse.data
      
      // If user not found, return unsorted neighbors
      if (!currentUser) return neighbors

      return neighbors.sort((a, b) => {
        let scoreA = 0
        let scoreB = 0

        // Score based on skill matches (what they offer that you need)
        const userSkillsNeeded = currentUser.skillsNeeded?.map((s: any) => s.name.toLowerCase()) || []
        const aSkillsOffered = a.rawUser.skillsOffered?.map((s: any) => s.name.toLowerCase()) || []
        const bSkillsOffered = b.rawUser.skillsOffered?.map((s: any) => s.name.toLowerCase()) || []

        userSkillsNeeded.forEach((needed: string) => {
          if (aSkillsOffered.some((offered: string) => offered.includes(needed) || needed.includes(offered))) scoreA += 10
          if (bSkillsOffered.some((offered: string) => offered.includes(needed) || needed.includes(offered))) scoreB += 10
        })

        // Score based on item matches (what they have that you need)
        const userItemsNeeded = currentUser.itemsNeeded?.map((i: any) => i.name.toLowerCase()) || []
        const aItemsOffered = a.rawUser.itemsOffered?.map((i: any) => i.name.toLowerCase()) || []
        const bItemsOffered = b.rawUser.itemsOffered?.map((i: any) => i.name.toLowerCase()) || []

        userItemsNeeded.forEach((needed: string) => {
          if (aItemsOffered.some((offered: string) => offered.includes(needed) || needed.includes(offered))) scoreA += 8
          if (bItemsOffered.some((offered: string) => offered.includes(needed) || needed.includes(offered))) scoreB += 8
        })

        // Score based on what you can offer them (mutual benefit)
        const userSkillsOffered = currentUser.skillsOffered?.map((s: any) => s.name.toLowerCase()) || []
        const aSkillsNeeded = a.rawUser.skillsNeeded?.map((s: any) => s.name.toLowerCase()) || []
        const bSkillsNeeded = b.rawUser.skillsNeeded?.map((s: any) => s.name.toLowerCase()) || []

        userSkillsOffered.forEach((offered: string) => {
          if (aSkillsNeeded.some((needed: string) => needed.includes(offered) || offered.includes(needed))) scoreA += 7
          if (bSkillsNeeded.some((needed: string) => needed.includes(offered) || offered.includes(needed))) scoreB += 7
        })

        // Boost new neighbors slightly
        if (a.isNew) scoreA += 2
        if (b.isNew) scoreB += 2

        // Closer neighbors get a small boost
        scoreA += Math.max(0, 5 - a.distance)
        scoreB += Math.max(0, 5 - b.distance)

        return scoreB - scoreA // Higher score = better match
      })
    } catch (error) {
      // Silently return unsorted neighbors if profile fetch fails
      // This happens when user hasn't created a profile yet
      return neighbors
    }
  }

  // Generate emoji avatar based on user name
  const getEmojiAvatar = (name: string, id: string) => {
    const emojis = ['👨‍🎨', '👩‍🌾', '👨‍🔧', '👩‍💻', '👨‍🍳', '👩‍🏫', '👨‍⚕️', '👩‍🎨', '👨‍💼', '👩‍🔬', '👨‍🚀', '👩‍🎤', '👨‍🏭', '👩‍✈️', '👨‍🚒', '👩‍⚖️']
    const hash = (name + id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return emojis[hash % emojis.length]
  }

  // Generate unique AI suggested messages based on user profile
  const generateSuggestedMessage = (user: any) => {
    const templates = [
      `Hi ${user.name}! I noticed you're into ${user.skillsOffered[0]?.name || 'helping neighbors'}. I'd love to learn more about what you do!`,
      `Hey ${user.name}, your ${user.itemsOffered[0]?.name || 'offerings'} caught my eye. Would love to connect and see how we can help each other!`,
      `Hi there ${user.name}! I see we might have some common interests. Let's chat about ${user.skillsOffered[0]?.category || 'our community'}!`,
      `Hello ${user.name}! I'm reaching out because I think we could collaborate on ${user.skillsNeeded[0]?.name || 'community projects'}. Interested?`,
      `Hey ${user.name}, I'm looking to build connections in the neighborhood. Your profile stood out to me!`,
      `Hi ${user.name}! I'd love to hear more about your experience with ${user.skillsOffered[0]?.name || 'community involvement'}. Coffee sometime?`,
      `Hello ${user.name}, I'm ${user.isNew ? 'welcoming you to the neighborhood' : 'excited to connect with you'}! Let's support each other!`,
      `Hi ${user.name}! I think there's great potential for us to help each other out. Would you be open to connecting?`,
    ]
    
    // Use a hash of the user ID to consistently pick the same template for each user
    const hash = user._id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    return templates[hash % templates.length]
  }

  useEffect(() => {
    async function fetchNeighbors() {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user ID for AI matching
        const currentUserId = localStorage.getItem('neighbornet_user_id')
        
        const apiFilters = {
          skills: filters.skills || [],
          items: filters.items || [],
          categories: filters.categories || [],
          timeAvailability: filters.timeAvailability || [],
          distance: filters.distance || 10,
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG,
          showNewNeighbors: filters.showNewNeighbors || false,
          userId: currentUserId || undefined, // Pass userId for AI matching (convert null to undefined)
        }

        const response = await userAPI.getUsers(apiFilters)
        
        // Filter out current user and transform API data to match component format
        const transformedData = response.data
          .filter((user: any) => {
            // Always filter out the current user's profile
            if (!currentUserId) return true
            return user._id !== currentUserId
          })
          .map((user: any) => ({
          id: user._id,
          name: user.name,
          avatar: user.avatar || '/default-avatar.png',
          tagline: user.tagline || '',
          offers: [
            ...user.skillsOffered.map((s: any) => s.name),
            ...user.itemsOffered.map((i: any) => i.name)
          ],
          needs: [
            ...user.skillsNeeded.map((s: any) => s.name),
            ...user.itemsNeeded.map((i: any) => i.name)
          ],
          distance: calculateDistance(
            DEFAULT_LAT,
            DEFAULT_LNG,
            user.location?.latitude || 0,
            user.location?.longitude || 0
          ),
          isNew: user.isNew,
          type: user.userType,
          aiSuggestedMessage: generateSuggestedMessage(user),
          aiMatchReason: user.aiMatchReason, // AI-generated match explanation
          rawUser: user, // Keep original user data for sorting
        }))

        // Sort neighbors by relevance to current user
        const sortedData = await sortByRelevance(transformedData, currentUserId)
        setNeighbors(sortedData)
      } catch (err: any) {
        console.error('Error fetching neighbors:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNeighbors()
  }, [filters])

  // Calculate distance helper
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3959 // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10 // Round to 1 decimal
  }

  const toggleLike = (id: string) => {
    setLikedNeighbors(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-4 h-full flex flex-col"
    >
      {/* Header */}
      <div className="space-y-2 pb-2">
        <h2 className="text-2xl font-bold text-foreground">
          Neighbors Found: {loading ? '...' : neighbors.length}
        </h2>
        <p className="text-sm text-muted-foreground">
          {loading ? 'Searching...' : 'Explore what your neighbors can share'}
        </p>
      </div>

      {/* Neighbors List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading neighbors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <p className="text-red-500">Error loading neighbors</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        ) : neighbors.length > 0 ? (
          neighbors.map((neighbor, index) => (
            <motion.div
              key={neighbor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectNeighbor(neighbor)}
              whileHover={{ y: -2 }}
              className={`group p-4 rounded-2xl bg-card/50 border border-border/50 cursor-pointer transition-all ${
                selectedNeighbor?.id === neighbor.id 
                  ? 'border-primary/60 bg-primary/5 shadow-md shadow-primary/15' 
                  : 'hover:border-primary/40 hover:shadow-md hover:shadow-primary/10'
              }`}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all">
                    {getEmojiAvatar(neighbor.name, neighbor.id)}
                  </div>
                  {neighbor.isNew && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-foreground">✓</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {neighbor.name}
                        {neighbor.isNew && (
                          <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">{neighbor.tagline}</p>
                    </div>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(neighbor.id)
                      }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <Heart 
                        size={18}
                        className={likedNeighbors.includes(neighbor.id) ? 'fill-accent text-accent animate-pulse' : ''}
                      />
                    </motion.button>
                  </div>

                  {/* Distance */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin size={12} />
                    {neighbor.distance} miles away
                  </div>

                  {/* AI Match Reason */}
                  {neighbor.aiMatchReason && (
                    <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                      <Sparkles size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {neighbor.aiMatchReason}
                      </p>
                    </div>
                  )}

                  {/* Offers & Needs */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">I can offer:</p>
                      <div className="flex flex-wrap gap-1">
                        {neighbor.offers.map(offer => (
                          <motion.div
                            key={offer}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Badge 
                              variant="outline"
                              className="text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 cursor-default transition-all"
                            >
                              {offer}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-secondary mb-1">I need:</p>
                      <div className="flex flex-wrap gap-1">
                        {neighbor.needs.map(need => (
                          <motion.div
                            key={need}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Badge 
                              variant="outline"
                              className="text-xs bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20 hover:border-secondary/50 cursor-default transition-all"
                            >
                              {need}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {showAIMessage === neighbor.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/20"
                    >
                      <p className="text-xs text-muted-foreground mb-2 font-medium">AI Suggested Opening:</p>
                      <p className="text-sm text-foreground mb-3 italic">"{neighbor.aiSuggestedMessage}"</p>
                      <Button
                        size="sm"
                        className="text-xs h-6 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Use & Edit
                      </Button>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAIMessage(showAIMessage === neighbor.id ? null : neighbor.id)
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all flex items-center gap-1"
                    >
                      <Zap size={12} />
                      Suggested message →
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Navigate to messages page with this neighbor selected
                          router.push(`/messages?userId=${neighbor.id}`)
                        }}
                        className="text-xs h-7 rounded-full border-primary/30 hover:border-primary/60 hover:text-primary hover:bg-primary/5"
                      >
                        <MessageCircle size={14} className="mr-1" />
                        Message
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            // Award points to current user for making a connection
                            const currentUserId = localStorage.getItem('neighbornet_user_id')
                            if (!currentUserId) {
                              alert('Please create a profile first to connect with neighbors!')
                              return
                            }
                            
                            const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/award-points`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ points: 10, type: 'connection' })
                            })
                            
                            if (response.ok) {
                              // Show success feedback
                              alert(`🎉 Connected with ${neighbor.name}! +10 points earned. Check the leaderboard!`)
                            }
                          } catch (error) {
                            console.error('Error awarding points:', error)
                            alert('Failed to connect. Please try again.')
                          }
                        }}
                        className="text-xs h-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                      >
                        <Sparkles size={14} className="mr-1" />
                        Connect
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <p>No neighbors match your filters. Try adjusting your preferences.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
