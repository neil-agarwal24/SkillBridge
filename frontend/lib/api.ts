const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Generic fetch wrapper
async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: FetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      console.error('API Error:', {
        url,
        status: response.status,
        message: errorMessage,
        responseData: data
      });
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    // Handle network errors
    if (!error.status) {
      console.error('Network Error:', {
        url,
        message: error.message,
        type: error.name
      });
      const networkError = new Error(`Network error: Unable to reach server at ${API_BASE_URL}`);
      (networkError as any).originalError = error;
      throw networkError;
    }
    // Don't log 404 errors - they're expected for missing profiles
    if (error.status !== 404) {
      console.error('API Error:', error);
    }
    throw error;
  }
}

interface UserFilters {
  skills?: string[];
  items?: string[];
  categories?: string[];
  timeAvailability?: string[];
  distance?: number;
  lat?: number;
  lng?: number;
  showNewNeighbors?: boolean;
  search?: string;
  userId?: string;
}

// User API
export const userAPI = {
  // Get all users with optional filters
  getUsers: (filters: UserFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.skills?.length) {
      params.append('skills', filters.skills.join(','));
    }
    if (filters.items?.length) {
      params.append('items', filters.items.join(','));
    }
    if (filters.categories?.length) {
      params.append('categories', filters.categories.join(','));
    }
    if (filters.timeAvailability?.length) {
      params.append('timeAvailability', filters.timeAvailability.join(','));
    }
    if (filters.distance) {
      params.append('distance', filters.distance.toString());
    }
    if (filters.lat) {
      params.append('lat', filters.lat.toString());
    }
    if (filters.lng) {
      params.append('lng', filters.lng.toString());
    }
    if (filters.showNewNeighbors) {
      params.append('showNewNeighbors', 'true');
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.userId) {
      params.append('userId', filters.userId);
    }

    const queryString = params.toString();
    return fetchAPI(`/users${queryString ? `?${queryString}` : ''}`);
  },

  // Get single user by ID
  getUser: async (id: string) => {
    try {
      return await fetchAPI(`/users/${id}`);
    } catch (error: any) {
      // Return null if user not found (404 or error message contains "not found")
      if (error.status === 404 || error.message?.toLowerCase().includes('not found')) {
        return { success: false, data: null };
      }
      throw error;
    }
  },

  // Create new user
  createUser: (userData: any) => 
    fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Update user
  updateUser: (id: string, userData: any) =>
    fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Delete user
  deleteUser: (id: string) =>
    fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Add skill
  addSkill: (userId: string, skillData: any) =>
    fetchAPI(`/users/${userId}/skills`, {
      method: 'POST',
      body: JSON.stringify(skillData),
    }),

  // Remove skill
  removeSkill: (userId: string, skillId: string, type: string) =>
    fetchAPI(`/users/${userId}/skills/${skillId}?type=${type}`, {
      method: 'DELETE',
    }),

  // Add item
  addItem: (userId: string, itemData: any) =>
    fetchAPI(`/users/${userId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),

  // Remove item
  removeItem: (userId: string, itemId: string, type: string) =>
    fetchAPI(`/users/${userId}/items/${itemId}?type=${type}`, {
      method: 'DELETE',
    }),

  // Toggle favorite
  toggleFavorite: (userId: string, targetId: string) =>
    fetchAPI(`/users/${userId}/favorite/${targetId}`, {
      method: 'POST',
    }),
};

// Message API
export const messageAPI = {
  // Get conversations for user
  getConversations: (userId: string) =>
    fetchAPI(`/messages/conversations/${userId}`),

  // Get messages in conversation
  getMessages: (conversationId: string, limit = 50, skip = 0) =>
    fetchAPI(`/messages/conversation/${conversationId}?limit=${limit}&skip=${skip}`),

  // Send message
  sendMessage: (messageData: any) =>
    fetchAPI('/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),

  // Mark messages as read
  markAsRead: (conversationId: string, userId: string) =>
    fetchAPI(`/messages/read/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    }),

  // Get AI suggestion
  getAISuggestion: (senderId: string, receiverId: string, context?: string) =>
    fetchAPI('/messages/ai-suggest', {
      method: 'POST',
      body: JSON.stringify({ senderId, receiverId, context }),
    }),

  // Delete message
  deleteMessage: (messageId: string) =>
    fetchAPI(`/messages/${messageId}`, {
      method: 'DELETE',
    }),
};

// Translation API
export const translationAPI = {
  // Preview translation for live typing
  previewTranslation: (text: string, recipientId: string, senderId?: string) =>
    fetchAPI('/translation/preview', {
      method: 'POST',
      body: JSON.stringify({ text, recipientId, senderId }),
    }),

  // Get translation stats
  getStats: () => fetchAPI('/translation/stats'),
};

// Emergency API
export const emergencyAPI = {
  // Create emergency broadcast
  createEmergency: (data: {
    type: string;
    severity: number;
    description: string;
    requesterId: string;
  }) =>
    fetchAPI('/emergencies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get emergency details
  getEmergency: (emergencyId: string) =>
    fetchAPI(`/emergencies/${emergencyId}`),

  // Respond to emergency
  respondToEmergency: (emergencyId: string, userId: string) =>
    fetchAPI(`/emergencies/${emergencyId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    }),

  // Update responder status
  updateResponderStatus: (emergencyId: string, userId: string, status: string) =>
    fetchAPI(`/emergencies/${emergencyId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, status }),
    }),

  // Resolve emergency
  resolveEmergency: (emergencyId: string, userId: string) =>
    fetchAPI(`/emergencies/${emergencyId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    }),

  // Get active emergencies
  getActiveEmergencies: () =>
    fetchAPI('/emergencies/active'),

  // Get emergency history
  getEmergencyHistory: (userId: string) =>
    fetchAPI(`/emergencies/history?userId=${userId}`),

  // Report emergency
  reportEmergency: (emergencyId: string, userId: string, reason: string) =>
    fetchAPI(`/emergencies/${emergencyId}/report`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, reason }),
    }),
};

// Health check
export const healthCheck = () => fetchAPI('/health');

export default {
  userAPI,
  messageAPI,
  translationAPI,
  emergencyAPI,
  healthCheck,
};
