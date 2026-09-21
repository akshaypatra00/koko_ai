import { supabase, isSupabaseConfigured } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Retrieves the active Supabase user session access token.
 */
async function getAuthToken() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session.access_token;
  } catch (err) {
    console.warn('[apiClient] Could not get session token:', err);
    return null;
  }
}

/**
 * Core authenticated fetch wrapper for Koko AI Backend.
 */
async function apiFetch(endpoint, options = {}) {
  const token = (await getAuthToken()) || 'demo-token';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMessage);
    err.status = response.status;
    err.code = data?.error?.code || 'API_ERROR';
    err.details = data?.error?.details;
    throw err;
  }

  return data;
}

// ==============================================================================
// PUBLIC API METHODS
// ==============================================================================

export const apiClient = {
  /**
   * Health Check
   */
  async checkHealth() {
    return apiFetch('/health');
  },

  /**
   * Chat: Send message to multi-model orchestrator
   */
  async sendMessage({
    conversationId,
    message,
    attachments = [],
    preferredProvider = 'auto',
    responseMode = 'normal',
  }) {
    return apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        message,
        attachments,
        preferredProvider,
        responseMode,
      }),
    });
  },

  /**
   * Chat: Regenerate the last response with updated provider/model
   */
  async regenerateMessage({ conversationId, messageId, preferredProvider = 'auto' }) {
    return apiFetch('/chat/regenerate', {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        messageId,
        preferredProvider,
      }),
    });
  },

  /**
   * Promptimization: Optimize human input with enterprise constraints
   */
  async optimizePrompt({ message, targetMode = 'auto' }) {
    return apiFetch('/chat/optimize-prompt', {
      method: 'POST',
      body: JSON.stringify({ message, targetMode }),
    });
  },

  /**
   * Conversations: List user's conversations
   */
  async getConversations() {
    return apiFetch('/conversations');
  },

  /**
   * Conversations: Create a new conversation
   */
  async createConversation(title = 'New conversation') {
    return apiFetch('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  /**
   * Conversations: Get a single conversation
   */
  async getConversation(conversationId) {
    return apiFetch(`/conversations/${conversationId}`);
  },

  /**
   * Conversations: Update conversation title
   */
  async updateConversation(conversationId, title) {
    return apiFetch(`/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  /**
   * Conversations: Delete conversation
   */
  async deleteConversation(conversationId) {
    return apiFetch(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Messages: Get chronological messages for a conversation
   */
  async getConversationMessages(conversationId) {
    return apiFetch(`/conversations/${conversationId}/messages`);
  },

  /**
   * Profile: Get user profile
   */
  async getProfile() {
    return apiFetch('/profile');
  },

  /**
   * Profile: Update profile details
   */
  async updateProfile(updates) {
    return apiFetch('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Profile: Get user preferences
   */
  async getPreferences() {
    return apiFetch('/profile/preferences');
  },

  /**
   * Profile: Update user preferences
   */
  async updatePreferences(preferences) {
    return apiFetch('/profile/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  },

  /**
   * Memories: Get user's durable memories
   */
  async getMemories() {
    return apiFetch('/memories');
  },

  /**
   * Memories: Create new memory
   */
  async createMemory(memoryData) {
    return apiFetch('/memories', {
      method: 'POST',
      body: JSON.stringify(memoryData),
    });
  },

  /**
   * Memories: Delete memory
   */
  async deleteMemory(memoryId) {
    return apiFetch(`/memories/${memoryId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Feedback: Submit message rating (up / down)
   */
  async submitFeedback({ messageId, rating, reason = '' }) {
    return apiFetch('/feedback', {
      method: 'POST',
      body: JSON.stringify({ messageId, rating, reason }),
    });
  },
};

export default apiClient;
