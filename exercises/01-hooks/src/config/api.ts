/**
 * API Configuration
 * Central configuration for API endpoints
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    USERS: '/users',
    TRANSACTIONS: '/transactions',
    CATEGORIES: '/categories',
  },
} as const;

/**
 * Helper to build full API URLs
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
