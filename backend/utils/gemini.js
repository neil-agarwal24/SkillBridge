const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Cache for match explanations to avoid repeated API calls
const explanationCache = new Map();

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
  if (explanationCache.has(cacheKey)) {
    return explanationCache.get(cacheKey);
  }

  // If no API key, return a simple fallback
  if (!genAI) {
    const fallback = generateFallbackExplanation(currentUser, neighbor);
    explanationCache.set(cacheKey, fallback);
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
    explanationCache.set(cacheKey, explanation);

    return explanation;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    // Return fallback on error
    const fallback = generateFallbackExplanation(currentUser, neighbor);
    explanationCache.set(cacheKey, fallback);
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

module.exports = {
  generateMatchExplanation,
  generateBatchMatchExplanations
};
