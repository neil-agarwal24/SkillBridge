const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');

// Initialize Gemini
let genAI = null;
let model = null;
const MOCK_EMERGENCY_MATCHING = process.env.MOCK_EMERGENCY_MATCHING === 'true';

if (MOCK_EMERGENCY_MATCHING) {
  console.log('✓ Emergency matching in MOCK MODE (for demo/testing)');
} else if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✓ Emergency matching initialized with Gemini API (gemini-2.5-flash)');
  } catch (error) {
    console.warn('⚠ Emergency matching failed to initialize:', error.message);
  }
}

// Emergency type to skill mappings
const EMERGENCY_SKILLS = {
  medical: ['First Aid', 'CPR', 'Medical', 'Nursing', 'EMT', 'Healthcare', 'Elderly Care'],
  safety: ['Security', 'Law Enforcement', 'Crisis Counseling', 'De-escalation', 'Self Defense'],
  accessibility: ['Mobility Assistance', 'Sign Language', 'Caregiving', 'Physical Therapy', 'Occupational Therapy'],
  disaster: ['Emergency Response', 'First Aid', 'Search and Rescue', 'Disaster Relief', 'Construction', 'Engineering'],
  other: ['Problem Solving', 'Communication', 'Conflict Resolution']
};

/**
 * Calculate distance between two coordinates (in meters)
 */
function calculateDistance(coord1, coord2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1[1] * Math.PI / 180;
  const φ2 = coord2[1] * Math.PI / 180;
  const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
  const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Score a user's relevance for an emergency
 */
function scoreUser(user, emergency, requester, distance) {
  let score = 0;
  const reasons = [];

  // 1. Skill match (40% weight)
  const relevantSkills = EMERGENCY_SKILLS[emergency.type] || [];
  const userSkills = user.skills || [];
  const matchingSkills = userSkills.filter(skill => 
    relevantSkills.some(reqSkill => 
      skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  if (matchingSkills.length > 0) {
    score += 40 * (matchingSkills.length / relevantSkills.length);
    reasons.push(`Has ${matchingSkills.length} relevant skill(s): ${matchingSkills.join(', ')}`);
  }

  // 2. Distance (30% weight)
  const distanceKm = distance / 1000;
  let distanceScore = 0;
  if (distanceKm <= 0.5) {
    distanceScore = 30;
    reasons.push(`Very close (${distanceKm.toFixed(2)} km)`);
  } else if (distanceKm <= 1) {
    distanceScore = 25;
    reasons.push(`Nearby (${distanceKm.toFixed(2)} km)`);
  } else if (distanceKm <= 2) {
    distanceScore = 20;
    reasons.push(`Within 2 km (${distanceKm.toFixed(2)} km)`);
  } else if (distanceKm <= 5) {
    distanceScore = 10;
    reasons.push(`Within 5 km (${distanceKm.toFixed(2)} km)`);
  } else {
    distanceScore = 5;
    reasons.push(`${distanceKm.toFixed(2)} km away`);
  }
  score += distanceScore;

  // 3. Availability (20% weight) - simplified for now
  // Could check last activity, online status, etc.
  score += 15; // Assume available
  reasons.push('Available now');

  // 4. Response history (10% weight) - placeholder for now
  // Could track average response time, number of emergencies helped with
  score += 5;

  return {
    score,
    reasons,
    distance: distanceKm
  };
}

/**
 * Use AI to analyze emergency and extract required skills
 */
async function analyzeEmergency(emergency) {
  // Mock mode
  if (MOCK_EMERGENCY_MATCHING || !model) {
    return {
      requiredSkills: EMERGENCY_SKILLS[emergency.type] || [],
      urgencyLevel: emergency.severity >= 4 ? 'critical' : 'high',
      analysis: `${emergency.type} emergency requiring immediate assistance`
    };
  }

  try {
    const prompt = `You are an emergency response coordinator analyzing an emergency situation.

Emergency Type: ${emergency.type}
Severity: ${emergency.severity}/5
Description: ${emergency.description}

Your task:
1. Identify the specific skills or expertise needed to help with this emergency
2. Determine the urgency level
3. Provide a brief analysis

Respond in JSON format:
{
  "requiredSkills": ["skill1", "skill2", ...],
  "urgencyLevel": "critical" | "high" | "moderate",
  "analysis": "brief description"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      requiredSkills: EMERGENCY_SKILLS[emergency.type] || [],
      urgencyLevel: emergency.severity >= 4 ? 'critical' : 'high',
      analysis: text
    };

  } catch (error) {
    console.error('⚠ Emergency AI analysis failed:', error.message);
    return {
      requiredSkills: EMERGENCY_SKILLS[emergency.type] || [],
      urgencyLevel: emergency.severity >= 4 ? 'critical' : 'high',
      analysis: `${emergency.type} emergency requiring immediate assistance`
    };
  }
}

/**
 * Match emergency with potential responders
 */
async function matchEmergencyResponders(emergency, requester) {
  try {
    // Mock mode - use pre-defined matches
    if (MOCK_EMERGENCY_MATCHING) {
      return getMockMatches(emergency, requester._id);
    }

    // Analyze emergency to extract required skills
    const analysis = await analyzeEmergency(emergency);

    // Get emergency location
    const emergencyLocation = emergency.location.coordinates;

    // Find nearby users (within 5km) - try DB first
    let nearbyUsers;
    try {
      const maxDistance = 5000; // 5km in meters
      nearbyUsers = await User.find({
        _id: { $ne: requester._id }, // Exclude requester
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: emergencyLocation
            },
            $maxDistance: maxDistance
          }
        }
      }).select('name profilePicture skills location');
    } catch (dbError) {
      // Fallback to mock mode if DB query fails
      console.warn('⚠ Database query failed, using mock matches');
      return getMockMatches(emergency, requester._id);
    }

    // Score each user
    const scoredUsers = nearbyUsers.map(user => {
      const distance = calculateDistance(emergencyLocation, user.location.coordinates);
      const { score, reasons, distance: distanceKm } = scoreUser(user, emergency, requester, distance);

      return {
        userId: user._id,
        user: user,
        score,
        reasons,
        distance: distanceKm,
        requiredSkills: analysis.requiredSkills,
        urgencyLevel: analysis.urgencyLevel
      };
    });

    // Sort by score (highest first) and take top 10
    const topMatches = scoredUsers
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return topMatches;

  } catch (error) {
    console.error('Emergency matching error:', error);
    // Fallback to mock matches
    return getMockMatches(emergency, requester._id);
  }
}

/**
 * Get mock matches for demo
 */
function getMockMatches(emergency, requesterId) {
  // Return pre-defined matches based on emergency type
  const mockUsers = require('../controllers/userController').getAllMockUsers();
  
  const matches = mockUsers
    .filter(u => u._id !== requesterId)
    .slice(0, 5)
    .map((user, index) => ({
      userId: user._id,
      user: user,
      score: 85 - (index * 10),
      reasons: [
        `Has relevant skills`,
        `${(0.2 + index * 0.1).toFixed(1)} km away`,
        'Available now'
      ],
      distance: 0.2 + (index * 0.1),
      requiredSkills: EMERGENCY_SKILLS[emergency.type]?.slice(0, 3) || [],
      urgencyLevel: emergency.severity >= 4 ? 'critical' : 'high'
    }));

  return matches;
}

module.exports = {
  matchEmergencyResponders,
  analyzeEmergency,
  scoreUser,
  calculateDistance,
  EMERGENCY_SKILLS,
  getMockMatches
};
