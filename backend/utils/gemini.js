const { GoogleGenerativeAI } = require('@google/generative-ai');
const LRUCache = require('./aiCache');

// Initialize Gemini
let genAI = null;
let aiEnabled = false;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    aiEnabled = true;
    console.log('✓ Gemini AI initialized');
  } catch (error) {
    console.error('✗ Failed to initialize Gemini AI:', error.message);
  }
} else {
  console.warn('⚠️  GEMINI_API_KEY not configured - AI features will use fallbacks');
}

// Initialize caches with TTL and size limits
const matchCache = new LRUCache(
  parseInt(process.env.AI_CACHE_MAX_SIZE) || 1000,
  parseInt(process.env.AI_CACHE_TTL_MINUTES) || 60
);

const messageCache = new LRUCache(500, 30); // 500 entries, 30 min TTL

// Run cache cleanup every 10 minutes
setInterval(() => {
  const matchCleaned = matchCache.cleanup();
  const msgCleaned = messageCache.cleanup();
  if (matchCleaned > 0 || msgCleaned > 0) {
    console.log(`Cache cleanup: ${matchCleaned} match + ${msgCleaned} message entries expired`);
  }
}, 10 * 60 * 1000);

// Error categorization for logging
const logAIError = (context, error) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message
  };

  if (error.message.includes('API_KEY')) {
    errorInfo.category = 'API_KEY_INVALID';
  } else if (error.message.includes('429') || error.message.includes('quota')) {
    errorInfo.category = 'RATE_LIMIT_EXCEEDED';
  } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
    errorInfo.category = 'NETWORK_ERROR';
  } else {
    errorInfo.category = 'UNKNOWN_ERROR';
  }

  console.error('[AI Error]', JSON.stringify(errorInfo));
  return errorInfo;
};

/**
 * Generate AI-powered match explanation between current user and a neighbor
 * @param {Object} currentUser - The current user's profile
 * @param {Object} neighbor - The neighbor's profile
 * @returns {Promise<string>} - Match explanation
 */
async function generateMatchExplanation(currentUser, neighbor) {
  // Create cache key
  const cacheKey = `${currentUser._id}-${neighbor._id}`;
  
  // Return cached explanation if available
  const cached = matchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // If no API key, return a simple fallback
  if (!genAI) {
    const fallback = generateFallbackExplanation(currentUser, neighbor);
    matchCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a helpful community assistant matching neighbors. Generate a SHORT (1-2 sentences) personalized explanation of why these two neighbors are a good match.

Current User:
- Skills Offered: ${currentUser.skillsOffered?.map(s => s.name).join(', ') || 'None'}
- Skills Needed: ${currentUser.skillsNeeded?.map(s => s.name).join(', ') || 'None'}
- Items Offered: ${currentUser.itemsOffered?.map(i => i.name).join(', ') || 'None'}
- Items Needed: ${currentUser.itemsNeeded?.map(i => i.name).join(', ') || 'None'}

Neighbor (${neighbor.name}):
- Skills Offered: ${neighbor.skillsOffered?.map(s => s.name).join(', ') || 'None'}
- Skills Needed: ${neighbor.skillsNeeded?.map(s => s.name).join(', ') || 'None'}
- Items Offered: ${neighbor.itemsOffered?.map(i => i.name).join(', ') || 'None'}
- Items Needed: ${neighbor.itemsNeeded?.map(i => i.name).join(', ') || 'None'}

Write a friendly, specific explanation focusing on mutual benefits. Keep it under 50 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text().trim();

    // Cache the explanation
    matchCache.set(cacheKey, explanation);

    return explanation;
  } catch (error) {
    logAIError('generateMatchExplanation', error);
    // Return fallback on error
    const fallback = generateFallbackExplanation(currentUser, neighbor);
    matchCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Generate a simple rule-based explanation as fallback
 */
function generateFallbackExplanation(currentUser, neighbor) {
  const theyOffer = [];
  const youOffer = [];
  const itemMatches = [];

  // Check skill matches (what they offer that you need)
  const userSkillsNeeded = currentUser.skillsNeeded?.map(s => s.name.toLowerCase()) || [];
  const neighborSkillsOffered = neighbor.skillsOffered?.map(s => s.name) || [];
  
  neighborSkillsOffered.forEach(offered => {
    const offeredLower = offered.toLowerCase();
    const match = userSkillsNeeded.find(needed => 
      offeredLower.includes(needed) || needed.includes(offeredLower)
    );
    if (match) {
      theyOffer.push(offered);
    }
  });

  // Check item matches (what they have that you need)
  const userItemsNeeded = currentUser.itemsNeeded?.map(i => i.name.toLowerCase()) || [];
  const neighborItemsOffered = neighbor.itemsOffered?.map(i => i.name) || [];
  
  neighborItemsOffered.forEach(offered => {
    const offeredLower = offered.toLowerCase();
    const match = userItemsNeeded.find(needed => 
      offeredLower.includes(needed) || needed.includes(offeredLower)
    );
    if (match) {
      itemMatches.push(offered);
    }
  });

  // Check reverse matches (what you can offer them)
  const userSkillsOffered = currentUser.skillsOffered?.map(s => s.name) || [];
  const neighborSkillsNeeded = neighbor.skillsNeeded?.map(s => s.name.toLowerCase()) || [];
  
  userSkillsOffered.forEach(offered => {
    const offeredLower = offered.toLowerCase();
    const match = neighborSkillsNeeded.find(needed => 
      offeredLower.includes(needed) || needed.includes(offeredLower)
    );
    if (match) {
      youOffer.push(offered);
    }
  });

  // Build explanation from matches
  const explanations = [];
  
  if (theyOffer.length > 0) {
    explanations.push(`${neighbor.name} offers ${theyOffer[0]} which you're looking for`);
  }
  
  if (itemMatches.length > 0) {
    explanations.push(`has ${itemMatches[0]} available`);
  }
  
  if (youOffer.length > 0 && explanations.length < 2) {
    explanations.push(`you can help with ${youOffer[0]}`);
  }

  // If we found matches, return them
  if (explanations.length > 0) {
    let result = explanations[0].charAt(0).toUpperCase() + explanations[0].slice(1);
    if (explanations.length > 1) {
      result += `. Plus, ${explanations[1]}`;
    }
    return result + '.';
  }

  // Check for category overlaps even without exact matches
  const userCategories = new Set([
    ...currentUser.skillsOffered?.map(s => s.category) || [],
    ...currentUser.skillsNeeded?.map(s => s.category) || []
  ]);
  const neighborCategories = new Set([
    ...neighbor.skillsOffered?.map(s => s.category) || [],
    ...neighbor.skillsNeeded?.map(s => s.category) || []
  ]);
  
  const sharedCategories = [...userCategories].filter(cat => neighborCategories.has(cat));
  
  if (sharedCategories.length > 0 && sharedCategories[0]) {
    return `Both interested in ${sharedCategories[0]}-related skills. Great potential for mutual support!`;
  }

  // New neighbor message
  if (neighbor.isNew) {
    return `${neighbor.name} just joined the community! Great opportunity to connect and explore mutual interests.`;
  }

  // Last resort: highlight their top skill/item
  if (neighborSkillsOffered.length > 0) {
    return `${neighbor.name} specializes in ${neighborSkillsOffered[0]}. Reach out to learn more!`;
  }
  if (neighborItemsOffered.length > 0) {
    return `${neighbor.name} has ${neighborItemsOffered[0]} to share with neighbors.`;
  }

  return `Connect with ${neighbor.name} to explore ways to support each other in the community.`;
}

/**
 * Generate match explanations for multiple neighbors at once
 */
async function generateBatchMatchExplanations(currentUser, neighbors) {
  const promises = neighbors.map(async (neighbor) => {
    const explanation = await generateMatchExplanation(currentUser, neighbor);
    return {
      ...neighbor,
      aiMatchReason: explanation
    };
  });

  return Promise.all(promises);
}

/**
 * Generate AI-powered message suggestions for conversation starter
 * @param {Object} sender - Sender's profile
 * @param {Object} receiver - Receiver's profile
 * @param {string} context - Optional conversation context
 * @returns {Promise<Object>} { suggestions: string[], source: 'ai' | 'fallback' }
 */
async function generateMessageSuggestions(sender, receiver, context = '') {
  // Create cache key
  const cacheKey = `${sender._id}-${receiver._id}`;
  
  // Return cached suggestions if available
  const cached = messageCache.get(cacheKey);
  if (cached) {
    return { suggestions: cached, source: 'ai', cached: true };
  }

  // If no API key, return fallback templates
  if (!genAI) {
    const fallbackSuggestions = generateFallbackMessageSuggestions(sender, receiver, context);
    return { suggestions: fallbackSuggestions, source: 'fallback' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate 3 unique conversation starters for ${sender.name} to message ${receiver.name}.

${sender.name}'s Profile:
- Skills Offered: ${sender.skillsOffered?.map(s => s.name).join(', ') || 'None'}
- Skills Needed: ${sender.skillsNeeded?.map(s => s.name).join(', ') || 'None'}
- Items Offered: ${sender.itemsOffered?.map(i => i.name).join(', ') || 'None'}
- Items Needed: ${sender.itemsNeeded?.map(i => i.name).join(', ') || 'None'}

${receiver.name}'s Profile:
- Skills Offered: ${receiver.skillsOffered?.map(s => s.name).join(', ') || 'None'}
- Skills Needed: ${receiver.skillsNeeded?.map(s => s.name).join(', ') || 'None'}
- Items Offered: ${receiver.itemsOffered?.map(i => i.name).join(', ') || 'None'}
- Items Needed: ${receiver.itemsNeeded?.map(i => i.name).join(', ') || 'None'}

${context ? `Context: ${context}` : ''}

Requirements:
- Tone: Friendly, neighbor-to-neighbor
- Focus on mutual benefit and specific interests
- Each message under 35 words
- Make them actionable (asking questions, proposing exchanges)
- Be specific about skills/items mentioned

Return exactly 3 suggestions, one per line, without numbering or bullets.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse suggestions (split by newlines, filter empty)
    const suggestions = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 3); // Ensure max 3

    // If we didn't get 3 suggestions, pad with fallbacks
    if (suggestions.length < 3) {
      const fallbacks = generateFallbackMessageSuggestions(sender, receiver, context);
      while (suggestions.length < 3) {
        suggestions.push(fallbacks[suggestions.length]);
      }
    }

    // Cache the suggestions
    messageCache.set(cacheKey, suggestions);

    return { suggestions, source: 'ai', cached: false };
  } catch (error) {
    logAIError('generateMessageSuggestions', error);
    // Return fallback on error
    const fallbackSuggestions = generateFallbackMessageSuggestions(sender, receiver, context);
    return { suggestions: fallbackSuggestions, source: 'fallback' };
  }
}

/**
 * Generate fallback message suggestions using templates
 */
function generateFallbackMessageSuggestions(sender, receiver, context = '') {
  const suggestions = [];
  
  const receiverSkill = receiver.skillsOffered?.[0]?.name || 'your skills';
  const receiverItem = receiver.itemsOffered?.[0]?.name || 'items';
  const senderSkill = sender.skillsOffered?.[0]?.name || 'helping out';
  
  suggestions.push(
    `Hi ${receiver.name}! I noticed you offer ${receiverSkill}. I'd love to connect and see how we can help each other!`
  );
  
  suggestions.push(
    `Hey ${receiver.name}! I see you have ${receiverItem} available. Would you be interested in an exchange or collaboration?`
  );
  
  if (context) {
    suggestions.push(
      `Hello ${receiver.name}! I'm reaching out about ${context}. Let's chat about how we can support each other!`
    );
  } else {
    suggestions.push(
      `Hi ${receiver.name}! I can help with ${senderSkill}. Want to grab coffee and discuss ways we can collaborate?`
    );
  }
  
  return suggestions;
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    matchExplanations: matchCache.getStats(),
    messageSuggestions: messageCache.getStats(),
    aiEnabled
  };
}

/**
 * Clear cache for specific user (when profile updated)
 */
function clearUserCache(userId) {
  const matchCleared = matchCache.clearPattern(userId);
  const msgCleared = messageCache.clearPattern(userId);
  return { matchCleared, msgCleared };
}

module.exports = {
  generateMatchExplanation,
  generateBatchMatchExplanations,
  generateMessageSuggestions,
  getCacheStats,
  clearUserCache,
  aiEnabled
};
