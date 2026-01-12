// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const response = await fetch(API_ENDPOINTS.register, {
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
    const response = await fetch(API_ENDPOINTS.me, {
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
    const response = await fetch(API_ENDPOINTS.passwordResetRequest, {
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
    const response = await fetch(API_ENDPOINTS.passwordResetVerify, {
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
    const response = await fetch(API_ENDPOINTS.passwordResetConfirm, {
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
    const response = await fetch(
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
  async updateUserRole(token: string, firebase_uid: string, role: 'admin' | 'user') {
    const response = await fetch(API_ENDPOINTS.adminUpdateRole, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firebase_uid, role }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update role');
    }
    
    return response.json();
  },

  // Delete user (admin only)
  async deleteUser(token: string, firebase_uid: string) {
    const response = await fetch(API_ENDPOINTS.adminDeleteUser(firebase_uid), {
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

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  fetchWithAuth,
  authService,
  adminService,
};
