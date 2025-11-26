import React from 'react';
import { Badge } from './badge';
import { Globe, AlertCircle } from 'lucide-react';

interface TranslationBadgeProps {
  variant?: 'translated' | 'original' | 'failed';
  languageName: string;
  className?: string;
}

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese',
  ar: 'Arabic',
  fr: 'French',
  vi: 'Vietnamese',
  tl: 'Tagalog',
  ko: 'Korean',
  hi: 'Hindi',
  pt: 'Portuguese',
  de: 'German',
  ja: 'Japanese',
  ru: 'Russian',
  it: 'Italian'
};

export function TranslationBadge({ 
  variant = 'translated', 
  languageName,
  className = '' 
}: TranslationBadgeProps) {
  const displayName = LANGUAGE_DISPLAY_NAMES[languageName] || languageName;

  if (variant === 'translated') {
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 text-xs bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200 ${className}`}
      >
        <Globe className="h-3 w-3" />
        <span>Translated from {displayName}</span>
      </Badge>
    );
  }

  if (variant === 'original') {
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 text-xs bg-gray-50 text-gray-700 border-gray-200 ${className}`}
      >
        <Globe className="h-3 w-3" />
        <span>Original {displayName}</span>
      </Badge>
    );
  }

  if (variant === 'failed') {
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 text-xs bg-red-50 text-red-700 border-red-200 ${className}`}
      >
        <AlertCircle className="h-3 w-3" />
        <span>Translation unavailable</span>
      </Badge>
    );
  }

  return null;
}
