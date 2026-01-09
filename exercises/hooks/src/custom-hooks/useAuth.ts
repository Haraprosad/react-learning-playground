import { useState, useCallback } from 'react';

/**
 * User Authentication State
 */
interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

/**
 * useAuth Hook
 * 
 * Manages user authentication state and provides login/logout functions.
 * In a real application, this would integrate with your auth provider.
 * 
 * @returns { isLoggedIn, user, login, logout }
 * 
 * @example
 * const { isLoggedIn, user, login, logout } = useAuth();
 * login({ id: '1', name: 'John', email: 'john@example.com' });
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
  });

  /**
   * Simulates user login
   * In a real app, this would call an authentication API
   */
  const login = useCallback((user: AuthUser) => {
    setAuthState({
      isLoggedIn: true,
      user,
    });
    // In a real app, you might also:
    // - Store auth token in localStorage/cookies
    // - Set authorization headers
    console.log('User logged in:', user);
  }, []);

  /**
   * Simulates user logout
   * In a real app, this would clear tokens and notify the backend
   */
  const logout = useCallback(() => {
    setAuthState({
      isLoggedIn: false,
      user: null,
    });
    // In a real app, you might also:
    // - Clear auth tokens
    // - Redirect to login page
    // - Clear sensitive data
    console.log('User logged out');
  }, []);

  return {
    isLoggedIn: authState.isLoggedIn,
    user: authState.user,
    login,
    logout,
  };
}
