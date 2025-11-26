import React from 'react';
import { Check } from 'lucide-react';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  className?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹' }
];

export function LanguageSelector({ value, onChange, className = '' }: LanguageSelectorProps) {
  return (
    <div className={className}>
      <Label className="text-base font-semibold mb-3 block">
        Message Language Preference
      </Label>
      <p className="text-sm text-muted-foreground mb-4">
        Messages sent to you will be automatically translated to this language
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => (
          <Card
            key={lang.code}
            className={`p-4 cursor-pointer transition-all hover:border-purple-300 hover:bg-purple-50/50 ${
              value === lang.code
                ? 'border-purple-500 bg-purple-50 shadow-sm'
                : 'border-gray-200'
            }`}
            onClick={() => onChange(lang.code)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-sm">{lang.name}</span>
              </div>
              {value === lang.code && (
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-purple-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {value && (
        <Card className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <p className="text-sm font-medium text-purple-900 mb-2">
            Preview: Messages will look like this
          </p>
          <Card className="p-3 bg-white">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-1">Neighbor</p>
                <p className="text-sm text-gray-800">
                  {value === 'en' && 'Hello! Can you help me tomorrow?'}
                  {value === 'es' && '¡Hola! ¿Puedes ayudarme mañana?'}
                  {value === 'zh' && '你好！你明天能帮我吗？'}
                  {value === 'ar' && 'مرحبا! هل يمكنك مساعدتي غدا؟'}
                  {value === 'fr' && 'Bonjour! Peux-tu m\'aider demain?'}
                  {value === 'vi' && 'Xin chào! Bạn có thể giúp tôi vào ngày mai không?'}
                  {value === 'tl' && 'Kumusta! Makakatulong ka ba sa akin bukas?'}
                  {value === 'ko' && '안녕하세요! 내일 도와줄 수 있나요?'}
                  {value === 'hi' && 'नमस्ते! क्या आप कल मेरी मदद कर सकते हैं?'}
                  {value === 'pt' && 'Olá! Você pode me ajudar amanhã?'}
                  {value === 'de' && 'Hallo! Kannst du mir morgen helfen?'}
                  {value === 'ja' && 'こんにちは！明日手伝ってもらえますか？'}
                  {value === 'ru' && 'Привет! Можешь помочь мне завтра?'}
                  {value === 'it' && 'Ciao! Puoi aiutarmi domani?'}
                </p>
                <p className="text-xs text-purple-600 mt-1">🌐 Translated from English</p>
              </div>
            </div>
          </Card>
        </Card>
      )}
    </div>
  );
}
