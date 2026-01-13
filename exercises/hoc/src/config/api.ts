// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Timeout for API requests (10 seconds)
const API_TIMEOUT = 10000;

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please check if backend is running on ' + API_BASE_URL);
    }
    throw error;
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  register: `${API_BASE_URL}/auth/register`,
  me: `${API_BASE_URL}/auth/me`,
  
  // Password Reset
  passwordResetRequest: `${API_BASE_URL}/auth/password-reset/request`,
  passwordResetVerify: `${API_BASE_URL}/auth/password-reset/verify`,
  passwordResetConfirm: `${API_BASE_URL}/auth/password-reset/confirm`,
  
  // User Endpoints
  userDashboard: `${API_BASE_URL}/user/dashboard`,
  
  // Admin Endpoints
  adminDashboard: `${API_BASE_URL}/admin/dashboard`,
  adminUsers: `${API_BASE_URL}/admin/users`,
  adminUpdateRole: `${API_BASE_URL}/admin/users/role`,
  adminDeleteUser: (uid: string) => `${API_BASE_URL}/admin/users/${uid}`,
  
  // Superadmin Endpoints
  superadminCreateUser: `${API_BASE_URL}/superadmin/users/create`,
  superadminDashboard: `${API_BASE_URL}/superadmin/dashboard`,
};

// Helper function to make authenticated API calls
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get Firebase token from your auth context or local storage
  const token = localStorage.getItem('firebaseToken'); // Adjust based on your implementation
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// API Service Functions
export const authService = {
  // Register user after Firebase auth
  async register(userData: {
    firebase_uid: string;
    email: string;
    name?: string;
    photo_url?: string;
    provider?: string;
  }) {
    const response = await fetchWithTimeout(API_ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    
    return response.json();
  },

  // Get current user info
  async getCurrentUser(token: string) {
    const response = await fetchWithTimeout(API_ENDPOINTS.me, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user');
    }
    
    return response.json();
  },

  // Request password reset
  async requestPasswordReset(email: string) {
    const response = await fetchWithTimeout(API_ENDPOINTS.passwordResetRequest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send reset email');
    }
    
    return response.json();
  },

  // Verify reset code
  async verifyResetCode(code: string) {
    const response = await fetchWithTimeout(API_ENDPOINTS.passwordResetVerify, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid reset code');
    }
    
    return response.json();
  },

  // Confirm password reset
  async confirmPasswordReset(code: string, newPassword: string) {
    const response = await fetchWithTimeout(API_ENDPOINTS.passwordResetConfirm, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, new_password: newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset password');
    }
    
    return response.json();
  },
};

export const adminService = {
  // Get all users (admin only)
  async getAllUsers(token: string, skip = 0, limit = 100) {
    const response = await fetchWithTimeout(
      `${API_ENDPOINTS.adminUsers}?skip=${skip}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch users');
    }
    
    return response.json();
  },

  // Update user role (admin only)
  async updateUserRole(token: string, firebase_uid: string, new_role: 'admin' | 'user') {
    const response = await fetchWithTimeout(API_ENDPOINTS.adminUpdateRole, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firebase_uid, new_role }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update role');
    }
    
    return response.json();
  },

  // Delete user (admin only)
  async deleteUser(token: string, firebase_uid: string) {
    const response = await fetchWithTimeout(API_ENDPOINTS.adminDeleteUser(firebase_uid), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete user');
    }
    
    return response.json();
  },
};

export const superadminService = {
  // Create user with role (superadmin only)
  async createUser(token: string, userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'user';
  }) {
    const response = await fetchWithTimeout(API_ENDPOINTS.superadminCreateUser, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create user');
    }
    
    return response.json();
  },

  // Get dashboard stats (superadmin only)
  async getDashboard(token: string) {
    const response = await fetchWithTimeout(API_ENDPOINTS.superadminDashboard, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch dashboard');
    }
    
    return response.json();
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  fetchWithAuth,
  authService,
  adminService,
  superadminService,
};
