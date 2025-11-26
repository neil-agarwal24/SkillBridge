const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const { getAICache } = require('./aiCache');

// API key guard - fail gracefully if missing
let genAI = null;
let model = null;
const cache = getAICache();
const MOCK_TRANSLATIONS = process.env.MOCK_TRANSLATIONS === 'true';

if (MOCK_TRANSLATIONS) {
  console.log('✓ Translation service in MOCK MODE (for demo/testing)');
} else if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash (latest stable model)
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✓ Translation service initialized with Gemini API (gemini-2.5-flash)');
  } catch (error) {
    console.warn('⚠ Translation service failed to initialize:', error.message);
  }
} else {
  console.warn('⚠ GEMINI_API_KEY not set - translations will not work');
  console.warn('  Set MOCK_TRANSLATIONS=true for demo mode');
}

// Constants
const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 3;
const TRANSLATION_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Language names for display
const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'fr': 'French',
  'vi': 'Vietnamese',
  'tl': 'Tagalog',
  'ko': 'Korean',
  'hi': 'Hindi',
  'pt': 'Portuguese',
  'de': 'German',
  'ja': 'Japanese',
  'ru': 'Russian',
  'it': 'Italian'
};

/**
 * Generate cache key using SHA-256 hash to prevent collisions
 */
function getCacheKey(text, sourceLang, targetLang) {
  return crypto
    .createHash('sha256')
    .update(`translate-${text}-${sourceLang}-${targetLang}`)
    .digest('hex');
}

/**
 * Validate message length
 */
function validateMessageLength(text) {
  if (text.length < MIN_MESSAGE_LENGTH) {
    return { valid: false, error: 'Message too short to translate' };
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message too long to translate (max ${MAX_MESSAGE_LENGTH} characters)` };
  }
  return { valid: true };
}

/**
 * Get language name from code
 */
function getLanguageName(langCode) {
  return LANGUAGE_NAMES[langCode] || langCode.toUpperCase();
}

/**
 * Translate text using Google Gemini API
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'es', 'zh')
 * @param {string} sourceLang - Source language code (optional, defaults to 'auto')
 * @returns {Promise<{translatedText: string, detectedLanguage: string, cached: boolean, skipped: boolean}>}
 */
async function translateText(text, targetLang, sourceLang = 'auto') {
  try {
    // Mock mode for demo/testing
    if (MOCK_TRANSLATIONS) {
      return getMockTranslation(text, targetLang, sourceLang);
    }

    // Check if model is available
    if (!model) {
      return {
        translatedText: text,
        detectedLanguage: sourceLang !== 'auto' ? sourceLang : null,
        error: 'Translation service not available (set MOCK_TRANSLATIONS=true for demo)',
        failed: true
      };
    }

    // Validate length
    const validation = validateMessageLength(text);
    if (!validation.valid) {
      return {
        translatedText: text,
        detectedLanguage: sourceLang !== 'auto' ? sourceLang : null,
        error: validation.error,
        skipped: true
      };
    }

    // Fast-path: skip translation if same language
    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      return {
        translatedText: text,
        detectedLanguage: sourceLang !== 'auto' ? sourceLang : null,
        skipped: true
      };
    }

    // Check cache first
    const cacheKey = getCacheKey(text, sourceLang, targetLang);
    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        translatedText: cached.translation,
        detectedLanguage: cached.sourceLang !== 'auto' ? cached.sourceLang : null,
        cached: true
      };
    }

    // Build prompt with safety guidelines
    const sourceHint = sourceLang !== 'auto' ? ` from ${getLanguageName(sourceLang)}` : '';
    const prompt = `You are a translator for a community platform connecting neighbors.
Translate the following conversational message${sourceHint} to ${getLanguageName(targetLang)}.

IMPORTANT RULES:
- Keep URLs, emails, phone numbers, and proper names EXACTLY as they appear
- Do NOT translate URLs (http://, https://, www.)
- Maintain the original tone and intent
- Use conversational language appropriate for casual chat
- Preserve all emojis and special characters
- Provide ONLY the translation, no explanations or notes

Text to translate:
${text}

Translation:`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    // Cache the result
    cache.set(cacheKey, {
      translation: translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang
    }, TRANSLATION_CACHE_TTL);

    return {
      translatedText,
      detectedLanguage: sourceLang !== 'auto' ? sourceLang : null,
      cached: false
    };

  } catch (error) {
    console.error('⚠ Translation API call failed:', error.message);
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      console.error('  → Network access may be restricted or Gemini API is unreachable');
    }
    
    // Graceful degradation - return original text
    return {
      translatedText: text,
      detectedLanguage: sourceLang !== 'auto' ? sourceLang : null,
      error: error.message,
      failed: true
    };
  }
}

/**
 * Get mock translation for demo purposes
 */
function getMockTranslation(text, targetLang, sourceLang) {
  // Skip if same language
  if (sourceLang !== 'auto' && sourceLang === targetLang) {
    return {
      translatedText: text,
      detectedLanguage: sourceLang,
      skipped: true,
      mock: true
    };
  }

  // Common phrase translations for better demo experience
  const commonPhrases = {
    es: {
      'Hello, my name is': 'Hola, mi nombre es',
      'Hi': 'Hola',
      'Hello': 'Hola',
      'Thank you': 'Gracias',
      'Good morning': 'Buenos días',
      'Good afternoon': 'Buenas tardes',
      'Good evening': 'Buenas noches',
      'How are you?': '¿Cómo estás?',
      'Nice to meet you': 'Encantado de conocerte',
      'I need help': 'Necesito ayuda',
      'Can you help me?': '¿Puedes ayudarme?',
    },
    zh: {
      'Hello, my name is': '你好，我叫',
      'Hi': '你好',
      'Hello': '你好',
      'Thank you': '谢谢',
      'Good morning': '早上好',
      'How are you?': '你好吗？',
      'Nice to meet you': '很高兴见到你',
    },
    fr: {
      'Hello, my name is': 'Bonjour, je m\'appelle',
      'Hi': 'Salut',
      'Hello': 'Bonjour',
      'Thank you': 'Merci',
      'Good morning': 'Bonjour',
      'How are you?': 'Comment allez-vous?',
    }
  };

  // Check if we have a translation for this phrase
  const phrases = commonPhrases[targetLang] || {};
  for (const [english, translation] of Object.entries(phrases)) {
    if (text.includes(english)) {
      const translatedText = text.replace(english, translation);
      return {
        translatedText,
        detectedLanguage: sourceLang !== 'auto' ? sourceLang : 'en',
        mock: true
      };
    }
  }

  // Fallback to prefix for unmatched phrases
  const mocks = {
    zh: `[中文] ${text}`,
    es: `[Español] ${text}`,
    fr: `[Français] ${text}`,
    de: `[Deutsch] ${text}`,
    ja: `[日本語] ${text}`,
    ko: `[한국어] ${text}`,
    ar: `[العربية] ${text}`,
    hi: `[हिंदी] ${text}`,
    pt: `[Português] ${text}`,
    ru: `[Русский] ${text}`,
    it: `[Italiano] ${text}`,
    vi: `[Tiếng Việt] ${text}`,
    tl: `[Tagalog] ${text}`
  };

  return {
    translatedText: mocks[targetLang] || `[${targetLang.toUpperCase()}] ${text}`,
    detectedLanguage: sourceLang !== 'auto' ? sourceLang : 'en',
    cached: false,
    mock: true
  };
}

/**
 * Get translation cache statistics
 */
function getTranslationStats() {
  const stats = cache.getStats();
  return {
    ...stats,
    supportedLanguages: Object.keys(LANGUAGE_NAMES).length,
    mockMode: MOCK_TRANSLATIONS
  };
}

module.exports = {
  translateText,
  getTranslationStats,
  getLanguageName,
  getCacheKey,
  LANGUAGE_NAMES,
  MAX_MESSAGE_LENGTH,
  MIN_MESSAGE_LENGTH
};
