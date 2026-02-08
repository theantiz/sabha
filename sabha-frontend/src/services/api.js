// API Service Layer for Sabha Backend
import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status);
    return response;
  },
  (error) => {
    console.error('[API] Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== API Endpoints ====================

/**
 * Create a new session
 * POST /sessions/
 * @param {object} payload - { title, topic }
 * @returns {Promise<object>} Session data
 */
export const createSession = async (payload) => {
  const response = await api.post('/sessions/', payload);
  return response.data;
};

/**
 * List sessions
 * GET /sessions/
 * @returns {Promise<array>} Sessions list
 */
export const listSessions = async () => {
  const response = await api.get('/sessions/');
  return response.data;
};

/**
 * Get session details including messages
 * GET /sessions/{id}/
 * @param {string|number} sessionId
 * @returns {Promise<object>} Session data
 */
export const getSession = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}/`);
  return response.data;
};

/**
 * Add a user message and trigger council
 * POST /sessions/{id}/messages/
 * @param {string|number} sessionId
 * @param {string} content
 * @returns {Promise<object>} Updated session data
 */
export const postSessionMessage = async (sessionId, content) => {
  const response = await api.post(`/sessions/${sessionId}/messages/`, { content });
  return response.data;
};

/**
 * List active agents
 * GET /agents/
 * @returns {Promise<array>} Agents list
 */
export const listAgents = async () => {
  const response = await api.get('/agents/');
  return response.data;
};

/**
 * Get agent details
 * GET /agents/{id}/
 * @param {string|number} agentId
 * @returns {Promise<object>} Agent data
 */
export const getAgent = async (agentId) => {
  const response = await api.get(`/agents/${agentId}/`);
  return response.data;
};

/**
 * List messages for a session
 * GET /messages/?session={id}
 * @param {string|number} sessionId
 * @returns {Promise<array>} Messages list
 */
export const listMessages = async (sessionId) => {
  const response = await api.get(`/messages/?session=${sessionId}`);
  return response.data;
};

/**
 * Convenience: submit topic -> create session
 * @param {string} topic
 * @returns {Promise<object>} Session data
 */
export const submitTopic = async (topic) => {
  if (!topic || topic.trim() === '') {
    throw new Error('Topic cannot be empty');
  }
  return createSession({ title: 'Sabha Discussion', topic: topic.trim() });
};

/**
 * Get discussion status from session
 * @param {string|number} sessionId
 * @returns {Promise<object>} Status data
 */
export const getDiscussionStatus = async (sessionId) => {
  const session = await getSession(sessionId);
  return { status: session.status || 'unknown' };
};

export default api;
