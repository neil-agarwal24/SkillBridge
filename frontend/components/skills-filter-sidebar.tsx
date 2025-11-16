'use client'

import { motion } from 'framer-motion'
import { X, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

const SKILL_OPTIONS = [
  'Tutoring',
  'Coding',
  'Graphic Design',
  'Gardening',
  'Home Repair',
  'Photography',
  'Music Lessons',
  'Fitness Coaching',
]

const ITEM_OPTIONS = [
  'Tools',
  'Books',
  'Kitchen Equipment',
  'Sports Gear',
  'Electronics',
  'Furniture',
  'Toys',
  'Garden Equipment',
]

const CATEGORY_OPTIONS = [
  'Skills',
  'Tools & Equipment',
  'Rides',
  'Childcare',
  'Pet Care',
  'Emergency Help',
]

const TIME_OPTIONS = [
  'Early Morning (5-9am)',
  'Morning (9am-12pm)',
  'Afternoon (12-5pm)',
  'Evening (5-9pm)',
  'Late Night (9pm+)',
]

const AI_FILTER_OPTIONS = [
  { id: 'best-matches', label: 'Best matches', description: 'AI picked these matches because they balance offers and needs and live within 1 mile.' },
  { id: 'cross-income', label: 'Cross-income bridges', description: 'Connections that bridge different income levels and backgrounds.' },
  { id: 'students-tutors', label: 'Students & tutors', description: 'Learning-focused connections with educators and students.' },
  { id: 'seniors', label: 'Seniors', description: 'Experienced neighbors with wisdom to share.' },
]

export function SkillsFilterSidebar({ filters, setFilters }) {
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    items: true,
    categories: true,
    distance: true,
    time: true,
    newNeighbors: true,
  })
  const [selectedAIFilter, setSelectedAIFilter] = useState(null)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCheckboxChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      skills: [],
      items: [],
      categories: [],
      distance: 5,
      timeAvailability: [],
      showNewNeighbors: false,
    })
    setSelectedAIFilter(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 h-full flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Discover</h2>
        <p className="text-sm text-muted-foreground">Filter to find neighbors and connections</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 p-4 rounded-2xl bg-accent/5 border border-accent/20"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles size={16} className="text-accent" />
          AI-Powered Filters
        </div>
        <div className="flex flex-wrap gap-2">
          {AI_FILTER_OPTIONS.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => setSelectedAIFilter(selectedAIFilter === option.id ? null : option.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                selectedAIFilter === option.id
                  ? 'bg-accent text-accent-foreground border border-accent shadow-sm'
                  : 'bg-background border border-border hover:border-accent/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
        {selectedAIFilter && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs text-muted-foreground italic mt-2"
          >
            {AI_FILTER_OPTIONS.find(f => f.id === selectedAIFilter)?.description}
          </motion.p>
        )}
      </motion.div>

      {/* Clear Filters */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full text-xs hover:bg-muted/50 hover:text-primary hover:border-primary/30"
        >
          Clear All Filters
        </Button>
      </motion.div>

      <div className="space-y-4 flex-1">
        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <motion.button
            onClick={() => toggleSection('skills')}
            whileHover={{ color: 'var(--color-primary)' }}
            className="flex items-center justify-between w-full font-semibold text-foreground transition-colors"
          >
            <span>Skills I Can Learn</span>
            <motion.div
              animate={{ rotate: expandedSections.skills ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.button>
          {expandedSections.skills && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {SKILL_OPTIONS.map((skill, i) => (
                <motion.label
                  key={skill}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.skills.includes(skill)}
                    onCheckedChange={() => handleCheckboxChange('skills', skill)}
                    className="group-hover:border-primary transition-colors"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {skill}
                  </span>
                </motion.label>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Items Section */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3 border-t border-border pt-4"
        >
          <motion.button
            onClick={() => toggleSection('items')}
            whileHover={{ color: 'var(--color-primary)' }}
            className="flex items-center justify-between w-full font-semibold text-foreground transition-colors"
          >
            <span>Items I Need</span>
            <motion.div
              animate={{ rotate: expandedSections.items ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.button>
          {expandedSections.items && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {ITEM_OPTIONS.map((item, i) => (
                <motion.label
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.items.includes(item)}
                    onCheckedChange={() => handleCheckboxChange('items', item)}
                    className="group-hover:border-primary transition-colors"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {item}
                  </span>
                </motion.label>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 border-t border-border pt-4"
        >
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full hover:text-primary transition-colors"
          >
            <h3 className="font-semibold text-foreground">Categories</h3>
            <ChevronDown 
              size={16}
              className={`transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {CATEGORY_OPTIONS.map(category => (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCheckboxChange('categories', category)}
                    className="group-hover:border-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Distance Section */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3 border-t border-border pt-4"
        >
          <motion.button
            onClick={() => toggleSection('distance')}
            whileHover={{ color: 'var(--color-primary)' }}
            className="flex items-center justify-between w-full font-semibold text-foreground transition-colors"
          >
            <span>Distance</span>
            <motion.div
              animate={{ rotate: expandedSections.distance ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.button>
          {expandedSections.distance && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 pt-2"
            >
              <Slider
                value={[filters.distance]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                min={0.5}
                max={15}
                step={0.5}
                className="w-full"
              />
              <div className="text-sm text-foreground font-semibold">
                Within <span className="text-primary">{filters.distance}</span> miles
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Time Availability Section */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 border-t border-border pt-4"
        >
          <button
            onClick={() => toggleSection('time')}
            className="flex items-center justify-between w-full hover:text-primary transition-colors"
          >
            <h3 className="font-semibold text-foreground">Time Availability</h3>
            <ChevronDown 
              size={16}
              className={`transition-transform ${expandedSections.time ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.time && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {TIME_OPTIONS.map(time => (
                <label key={time} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={filters.timeAvailability.includes(time)}
                    onCheckedChange={() => handleCheckboxChange('timeAvailability', time)}
                    className="group-hover:border-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {time}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* New Neighbors Section */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 border-t border-border pt-4"
        >
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={filters.showNewNeighbors}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, showNewNeighbors: checked }))
              }
              className="group-hover:border-primary"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Show only new neighbors
              </span>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </label>
        </motion.div>
      </div>
    </motion.div>
  )
}
