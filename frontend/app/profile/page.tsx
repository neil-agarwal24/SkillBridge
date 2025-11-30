'use client'

import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Camera, Plus, X } from 'lucide-react'
import { userAPI } from '@/lib/api'
import { LanguageSelector } from '@/components/language-selector'

const SKILL_OPTIONS = [
  'Math', 'English', 'Science', 'History', 'Spanish', 'French',
  'Coding', 'Physics', 'Chemistry', 'Biology', 'Writing', 'Reading',
  'Algebra', 'Geometry', 'Calculus', 'Essay Writing', 'Grammar',
  'Music', 'Art', 'Photography', 'Computer Science', 'SAT Prep'
]

const ITEM_OPTIONS = [
  'Textbooks', 'Study Guides', 'Calculator', 'Laptop', 'Notebooks',
  'Art Supplies', 'Musical Instrument', 'Lab Equipment', 'Reference Books', 'Flashcards'
]

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    tagline: '',
    avatar: null,
    skills: [],
    items: [],
    needsSkills: [],
    needsItems: [],
    availability: [],
    preferredLanguage: 'en',
  })
  const [userId, setUserId] = useState(null)
  const [showSkills, setShowSkills] = useState(false)
  const [showItems, setShowItems] = useState(false)
  const [showNeedsSkills, setShowNeedsSkills] = useState(false)
  const [showNeedsItems, setShowNeedsItems] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const toggleSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const toggleItem = (item) => {
    setProfileData(prev => ({
      ...prev,
      items: prev.items.includes(item)
        ? prev.items.filter(i => i !== item)
        : [...prev.items, item]
    }))
  }

  const toggleNeedsSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      needsSkills: prev.needsSkills.includes(skill)
        ? prev.needsSkills.filter(s => s !== skill)
        : [...prev.needsSkills, skill]
    }))
  }

  const toggleNeedsItem = (item) => {
    setProfileData(prev => ({
      ...prev,
      needsItems: prev.needsItems.includes(item)
        ? prev.needsItems.filter(i => i !== item)
        : [...prev.needsItems, item]
    }))
  }

  // Load existing profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const storedUserId = localStorage.getItem('neighbornet_user_id')
        
        if (storedUserId) {
          const response = await userAPI.getUser(storedUserId)
          const user = response.data
          
          // Only load profile if user exists
          if (user) {
            setUserId(storedUserId)
            setProfileData({
              name: user.name || '',
              bio: user.bio || '',
              location: user.location?.address || '',
              tagline: user.tagline || '',
              avatar: user.avatar || null,
              skills: user.skillsOffered?.map((s: any) => s.name) || [],
              items: user.itemsOffered?.map((i: any) => i.name) || [],
              needsSkills: user.skillsNeeded?.map((s: any) => s.name) || [],
              needsItems: user.itemsNeeded?.map((i: any) => i.name) || [],
              availability: user.availability || [],
              preferredLanguage: user.preferredLanguage || 'en',
            })
          } else {
            // User ID exists but no profile found - clear it
            localStorage.removeItem('neighbornet_user_id')
            setUserId(null)
          }
        }
      } catch (err: any) {
        // Silently handle user not found - they can create a new profile
        localStorage.removeItem('neighbornet_user_id')
        setUserId(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Transform data for API
      const userData = {
        name: profileData.name,
        bio: profileData.bio,
        tagline: profileData.tagline,
        location: {
          address: profileData.location,
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          latitude: 45.5152,
          longitude: -122.6784
        },
        avatar: profileData.avatar,
        skillsOffered: profileData.skills.map(name => ({
          name,
          category: 'Other',
          description: ''
        })),
        skillsNeeded: profileData.needsSkills.map(name => ({
          name,
          category: 'Other',
          description: ''
        })),
        itemsOffered: profileData.items.map(name => ({
          name,
          category: 'Other',
          condition: 'Good'
        })),
        itemsNeeded: profileData.needsItems.map(name => ({
          name,
          category: 'Other',
          description: ''
        })),
        availability: profileData.availability,
        preferredLanguage: profileData.preferredLanguage,
        userType: 'balanced',
        isNew: true
      }

      let response
      if (userId) {
        // Update existing user
        response = await userAPI.updateUser(userId, userData)
      } else {
        // Create new user
        response = await userAPI.createUser(userData)
        const newUserId = response.data._id
        setUserId(newUserId)
        localStorage.setItem('neighbornet_user_id', newUserId)
      }

      setSaveMessage('Profile saved successfully! 🎉')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setSaveMessage('Error saving profile. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Create Your Profile</h1>
              <p className="text-lg text-muted-foreground">Let neighbors know what you can offer and what you need</p>
            </div>

            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-foreground">Your Photo</h2>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                  {profileData.avatar ? (
                    <img src={profileData.avatar || "/placeholder.svg"} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8" />
                  )}
                </div>
                <Button className="rounded-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </motion.div>

            {/* Name & Bio */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-foreground">About You</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell neighbors about yourself, your interests, and what you love to do..."
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter your address or neighborhood (e.g., 123 Main St, Brooklyn, NY)"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your exact address won't be shown—just approximate distance to neighbors</p>
                </div>
              </div>
            </motion.div>

            {/* Skills I Can Teach */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-foreground">Skills I Can Teach</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowSkills(!showSkills)}
                  className="w-full p-3 rounded-xl border border-border hover:border-primary/50 text-left transition-all"
                >
                  <p className="text-sm font-medium text-foreground">
                    {profileData.skills.length > 0 ? `${profileData.skills.length} skills selected` : 'Select skills'}
                  </p>
                </button>
                {showSkills && (
                  <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-card/50 border border-border">
                    {SKILL_OPTIONS.map(skill => (
                      <label key={skill} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={profileData.skills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <span className="text-sm text-foreground">{skill}</span>
                      </label>
                    ))}
                  </div>
                )}
                {profileData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="rounded-full">
                        {skill}
                        <button
                          onClick={() => toggleSkill(skill)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Resources I Can Share */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-foreground">Resources I Can Share</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowItems(!showItems)}
                  className="w-full p-3 rounded-xl border border-border hover:border-primary/50 text-left transition-all"
                >
                  <p className="text-sm font-medium text-foreground">
                    {profileData.items.length > 0 ? `${profileData.items.length} items selected` : 'Select items'}
                  </p>
                </button>
                {showItems && (
                  <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-card/50 border border-border">
                    {ITEM_OPTIONS.map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={profileData.items.includes(item)}
                          onCheckedChange={() => toggleItem(item)}
                        />
                        <span className="text-sm text-foreground">{item}</span>
                      </label>
                    ))}
                  </div>
                )}
                {profileData.items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.items.map(item => (
                      <Badge key={item} variant="outline" className="rounded-full">
                        {item}
                        <button
                          onClick={() => toggleItem(item)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Skills I Want to Learn */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-secondary">Skills I Want to Learn</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowNeedsSkills(!showNeedsSkills)}
                  className="w-full p-3 rounded-xl border border-border hover:border-secondary/50 text-left transition-all"
                >
                  <p className="text-sm font-medium text-foreground">
                    {profileData.needsSkills.length > 0 ? `${profileData.needsSkills.length} skills selected` : 'Select skills you need'}
                  </p>
                </button>
                {showNeedsSkills && (
                  <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-card/50 border border-border">
                    {SKILL_OPTIONS.map(skill => (
                      <label key={skill} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={profileData.needsSkills.includes(skill)}
                          onCheckedChange={() => toggleNeedsSkill(skill)}
                        />
                        <span className="text-sm text-foreground">{skill}</span>
                      </label>
                    ))}
                  </div>
                )}
                {profileData.needsSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.needsSkills.map(skill => (
                      <Badge key={skill} variant="outline" className="rounded-full border-secondary/30 text-secondary">
                        {skill}
                        <button
                          onClick={() => toggleNeedsSkill(skill)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Resources I Need */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-secondary">Resources I Need</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowNeedsItems(!showNeedsItems)}
                  className="w-full p-3 rounded-xl border border-border hover:border-secondary/50 text-left transition-all"
                >
                  <p className="text-sm font-medium text-foreground">
                    {profileData.needsItems.length > 0 ? `${profileData.needsItems.length} items selected` : 'Select items you need'}
                  </p>
                </button>
                {showNeedsItems && (
                  <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-card/50 border border-border">
                    {ITEM_OPTIONS.map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={profileData.needsItems.includes(item)}
                          onCheckedChange={() => toggleNeedsItem(item)}
                        />
                        <span className="text-sm text-foreground">{item}</span>
                      </label>
                    ))}
                  </div>
                )}
                {profileData.needsItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.needsItems.map(item => (
                      <Badge key={item} variant="outline" className="rounded-full border-secondary/30 text-secondary">
                        {item}
                        <button
                          onClick={() => toggleNeedsItem(item)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Language Preference */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="space-y-4"
            >
              <LanguageSelector
                value={profileData.preferredLanguage}
                onChange={(lang) => handleInputChange('preferredLanguage', lang)}
              />
            </motion.div>

            {/* Save Message */}
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center"
              >
                <p className="text-sm font-medium text-primary">{saveMessage}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3 pt-4"
            >
              <Button 
                size="lg" 
                className="flex-1 rounded-full" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 rounded-full"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
