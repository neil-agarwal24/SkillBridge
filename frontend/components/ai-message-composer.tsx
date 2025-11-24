"use client"

import { useState } from 'react'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { messageAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AIMessageComposerProps {
  currentUserId: string
  targetUserId: string
  targetUserName?: string
  onSend: (message: string) => void
  className?: string
}

export function AIMessageComposer({
  currentUserId,
  targetUserId,
  targetUserName = 'neighbor',
  onSend,
  className
}: AIMessageComposerProps) {
  const [message, setMessage] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const fetchSuggestions = async () => {
    if (!currentUserId || !targetUserId) return

    setLoading(true)
    setShowSuggestions(true)

    try {
      const response = await messageAPI.getAISuggestion(currentUserId, targetUserId)
      
      if (response.success && response.data) {
        setSuggestions(response.data.suggestions || [])
        setSource(response.data.source || 'fallback')
      } else {
        // Fallback suggestions
        setSuggestions([
          `Hi ${targetUserName}! I'd love to connect and see how we can help each other.`,
          `Hello ${targetUserName}! I noticed your profile and think we could collaborate.`,
          `Hey ${targetUserName}! Let's chat about ways we can support each other.`
        ])
        setSource('fallback')
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error)
      // Fallback suggestions on error
      setSuggestions([
        `Hi ${targetUserName}! I'd love to connect and see how we can help each other.`,
        `Hello ${targetUserName}! I noticed your profile and think we could collaborate.`,
        `Hey ${targetUserName}! Let's chat about ways we can support each other.`
      ])
      setSource('fallback')
    } finally {
      setLoading(false)
    }
  }

  const selectSuggestion = (suggestion: string, index: number) => {
    setMessage(suggestion)
    setSelectedIndex(index)
    setShowSuggestions(false)
  }

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage('')
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* AI Suggestion Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchSuggestions}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-purple-500" />
              Get AI Suggestion
            </>
          )}
        </Button>

        {showSuggestions && suggestions.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            disabled={loading}
            className="gap-1 text-xs"
          >
            <RefreshCw size={12} />
            Regenerate
          </Button>
        )}

        {source === 'fallback' && showSuggestions && (
          <span className="text-xs text-muted-foreground">
            Using standard suggestions
          </span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-3 rounded-lg border bg-card space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Select a suggestion to use:
          </p>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion, index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  selectSuggestion(suggestion, index)
                }
              }}
              className={cn(
                "w-full text-left p-3 rounded-md border transition-all",
                "hover:bg-accent hover:border-primary/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedIndex === index && "bg-accent border-primary/50"
              )}
            >
              <p className="text-sm leading-relaxed">{suggestion}</p>
            </button>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="space-y-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${targetUserName}...`}
          className="min-h-[100px] resize-none"
        />
        
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
          >
            Send Message
          </Button>
        </div>
      </div>
    </div>
  )
}
