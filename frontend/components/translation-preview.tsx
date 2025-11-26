import React from 'react';
import { Card } from './ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';

interface TranslationPreviewProps {
  recipientName: string;
  recipientLanguage: string;
  translatedText: string;
  isLoading?: boolean;
  className?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
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

export function TranslationPreview({
  recipientName,
  recipientLanguage,
  translatedText,
  isLoading = false,
  className = ''
}: TranslationPreviewProps) {
  const languageName = LANGUAGE_NAMES[recipientLanguage] || recipientLanguage.toUpperCase();

  return (
    <Card className={`p-3 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 ${className}`}>
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-medium text-purple-900">
              {recipientName} will see:
            </p>
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
              {languageName}
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Translating...</span>
            </div>
          ) : (
            <p className="text-sm text-purple-800 leading-relaxed break-words">
              {translatedText}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
