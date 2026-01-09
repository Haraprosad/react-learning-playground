import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { User, LoginCredentials } from '../types/auth.types';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired, generateMockToken } from '../utils/tokenUtils';

const API_URL = 'http://localhost:3001';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Base query with automatic token injection
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Enhanced base query with automatic token refresh and retry logic
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let retryCount = 0;
  const MAX_RETRIES = 2;

  // Check if access token is expired before making request
  const accessToken = getAccessToken();
  if (accessToken && isTokenExpired(accessToken)) {
    console.log('[Auth] Access token expired, attempting refresh...');
    
    const refreshToken = getRefreshToken();
    if (refreshToken && !isTokenExpired(refreshToken)) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResult.data as RefreshResponse;
        setTokens(newAccessToken, newRefreshToken);
        console.log('[Auth] Token refreshed successfully');
      } else {
        console.log('[Auth] Token refresh failed, clearing tokens');
        clearTokens();
        // Don't immediately redirect, let the app handle it
        return {
          error: {
            status: 401,
            data: { message: 'Session expired. Please login again.' },
          } as FetchBaseQueryError,
        };
      }
    } else {
      console.log('[Auth] Refresh token expired or missing');
      clearTokens();
      return {
        error: {
          status: 401,
          data: { message: 'Session expired. Please login again.' },
        } as FetchBaseQueryError,
      };
    }
  }

  // Make the original request with retry logic
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 errors (unauthorized) with retry
  while (result.error && result.error.status === 401 && retryCount < MAX_RETRIES) {
    console.log(`[Auth] Received 401, attempt ${retryCount + 1}/${MAX_RETRIES} to refresh token...`);
    
    const refreshToken = getRefreshToken();
    if (refreshToken && !isTokenExpired(refreshToken)) {
      // Try to get a new token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResult.data as RefreshResponse;
        setTokens(newAccessToken, newRefreshToken);
        console.log('[Auth] Token refreshed successfully, retrying request');
        
        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
        retryCount++;
      } else {
        // Refresh failed
        console.log('[Auth] Token refresh failed');
        clearTokens();
        return {
          error: {
            status: 401,
            data: { message: 'Session expired. Please login again.' },
          } as FetchBaseQueryError,
        };
      }
    } else {
      // No valid refresh token
      console.log('[Auth] No valid refresh token available');
      clearTokens();
      return {
        error: {
          status: 401,
          data: { message: 'Session expired. Please login again.' },
        } as FetchBaseQueryError,
      };
    }
  }

  // If still getting 401 after retries, clear tokens
  if (result.error && result.error.status === 401) {
    console.log('[Auth] Max retries reached, clearing tokens');
    clearTokens();
  }

  return result;
};

/**
 * Auth API slice with RTK Query
 */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    /**
     * Login endpoint
     */
    login: builder.mutation<AuthResponse, LoginCredentials>({
      async queryFn(credentials, _api, _extraOptions, baseQuery) {
        try {
          // Query users from JSON Server
          const result = await baseQuery({
            url: `/users?username=${credentials.username}&password=${credentials.password}`,
            method: 'GET',
          });

          if (result.error) {
            return { error: result.error as FetchBaseQueryError };
          }

          const users = result.data as User[];
          
          if (!users || users.length === 0) {
            return {
              error: {
                status: 401,
                data: { message: 'Invalid username or password' },
              } as FetchBaseQueryError,
            };
          }

          const user = users[0];
          
          // Remove password from user object
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = user as User & { password?: string };

          // Generate mock JWT tokens (in production, these come from backend)
          const accessToken = generateMockToken(user.id, user.username, user.role, 15 * 60); // 15 minutes
          const refreshToken = generateMockToken(user.id, user.username, user.role, 7 * 24 * 60 * 60); // 7 days

          // Store tokens
          setTokens(accessToken, refreshToken);
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));

          return {
            data: {
              user: userWithoutPassword,
              accessToken,
              refreshToken,
            },
          };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['Auth'],
    }),

    /**
     * Refresh token endpoint
     */
    refreshToken: builder.mutation<RefreshResponse, { refreshToken: string }>({
      async queryFn({ refreshToken }) {
        try {
          // Validate refresh token
          if (isTokenExpired(refreshToken)) {
            return {
              error: {
                status: 401,
                data: { message: 'Refresh token expired' },
              } as FetchBaseQueryError,
            };
          }

          // Get user from localStorage
          const userStr = localStorage.getItem('user');
          if (!userStr) {
            return {
              error: {
                status: 401,
                data: { message: 'User not found' },
              } as FetchBaseQueryError,
            };
          }

          const user = JSON.parse(userStr) as User;

          // Generate new tokens
          const newAccessToken = generateMockToken(user.id, user.username, user.role, 15 * 60); // 15 minutes
          const newRefreshToken = generateMockToken(user.id, user.username, user.role, 7 * 24 * 60 * 60); // 7 days

          setTokens(newAccessToken, newRefreshToken);

          return {
            data: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
          };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
    }),

    /**
     * Logout endpoint
     */
    logout: builder.mutation<void, void>({
      async queryFn() {
        clearTokens();
        return { data: undefined };
      },
      invalidatesTags: ['Auth'],
    }),

    /**
     * Get current user endpoint
     */
    getCurrentUser: builder.query<User, void>({
      async queryFn() {
        try {
          const userStr = localStorage.getItem('user');
          if (!userStr) {
            return {
              error: {
                status: 404,
                data: { message: 'User not found' },
              } as FetchBaseQueryError,
            };
          }

          const user = JSON.parse(userStr) as User;
          return { data: user };
        } catch (error) {
          return {
            error: {
              status: 'PARSING_ERROR',
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;
