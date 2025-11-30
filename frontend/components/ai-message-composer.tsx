"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { messageAPI, translationAPI, userAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { TranslationPreview } from './translation-preview'

interface AIMessageComposerProps {
  currentUserId: string
  targetUserId: string
  targetUserName?: string
  onSend: (message: string, translationData?: any) => void
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
  
  // Translation state
  const [targetLanguage, setTargetLanguage] = useState<string>('en')
  const [senderLanguage, setSenderLanguage] = useState<string>('en')
  const [translationPreview, setTranslationPreview] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslationPreview, setShowTranslationPreview] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Fetch user languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      // Skip if no user IDs provided
      if (!currentUserId || !targetUserId) {
        setSenderLanguage('en');
        setTargetLanguage('en');
        return;
      }

      try {
        const [senderRes, targetRes] = await Promise.all([
          userAPI.getUser(currentUserId),
          userAPI.getUser(targetUserId)
        ]);
        
        // Use language preference if user exists and has one, otherwise default to 'en'
        if (senderRes?.success && senderRes?.data?.preferredLanguage) {
          setSenderLanguage(senderRes.data.preferredLanguage);
        } else {
          setSenderLanguage('en');
        }
        
        if (targetRes?.success && targetRes?.data?.preferredLanguage) {
          setTargetLanguage(targetRes.data.preferredLanguage);
        } else {
          setTargetLanguage('en');
        }
      } catch (error) {
        // Silently use defaults on error - user might not exist yet
        setSenderLanguage('en');
        setTargetLanguage('en');
      }
    };
    
    fetchLanguages();
  }, [currentUserId, targetUserId]);

  // Translation preview with debounce
  const fetchTranslationPreview = useCallback(async (text: string) => {
    // Skip if message is too short
    if (text.length < 5) {
      setShowTranslationPreview(false);
      return;
    }

    // Skip if message is too long
    if (text.length > 1000) {
      setShowTranslationPreview(false);
      return;
    }

    // Skip if same language
    if (senderLanguage === targetLanguage) {
      setShowTranslationPreview(false);
      return;
    }

    setIsTranslating(true);
    setShowTranslationPreview(true);

    try {
      const response = await translationAPI.previewTranslation(text, targetUserId, currentUserId);
      
      if (response.success && response.translation) {
        setTranslationPreview(response.translation);
      } else {
        console.warn('Translation preview returned unsuccessful response:', response);
        setTranslationPreview('Translation unavailable');
      }
    } catch (error: any) {
      // Only log unexpected errors (not rate limits or user-not-found)
      if (error?.status === 503 && !error?.message?.includes('rate limit')) {
        console.warn('⚠ Translation service temporarily unavailable');
      } else if (error?.status !== 404 && !error?.message?.toLowerCase().includes('not found') && !error?.message?.includes('rate limit')) {
        console.error('Translation preview failed:', error);
      }
      // Show original text when translation unavailable
      setTranslationPreview(null);
      setShowTranslationPreview(false);
    } finally {
      setIsTranslating(false);
    }
  }, [targetUserId, currentUserId, senderLanguage, targetLanguage]);

  // Debounced translation effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (message) {
      debounceTimer.current = setTimeout(() => {
        fetchTranslationPreview(message);
      }, 500); // 500ms debounce
    } else {
      setShowTranslationPreview(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [message, fetchTranslationPreview]);

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
    } catch (error: any) {
      // Silently use fallback suggestions on error (user might not exist yet)
      if (error?.status !== 404 && !error?.message?.toLowerCase().includes('not found')) {
        console.error('Failed to fetch AI suggestions:', error)
      }
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
      // Include translation data only if languages differ AND translation actually exists
      const translationData = senderLanguage !== targetLanguage && translationPreview && translationPreview !== 'Translation unavailable' ? {
        translation: translationPreview,
        sourceLang: senderLanguage,
        targetLang: targetLanguage
      } : undefined;

      onSend(message, translationData)
      setMessage('')
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
      setShowTranslationPreview(false)
      setTranslationPreview('')
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

        {/* Translation Preview */}
        {showTranslationPreview && senderLanguage !== targetLanguage && (
          <TranslationPreview
            recipientName={targetUserName}
            recipientLanguage={targetLanguage}
            translatedText={translationPreview}
            isLoading={isTranslating}
          />
        )}
        
        <div className="flex justify-between items-center">
          {message.length > 1000 && (
            <span className="text-xs text-red-500">
              Message too long to translate (max 1000 characters)
            </span>
          )}
          <div className="ml-auto">
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
            >
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
