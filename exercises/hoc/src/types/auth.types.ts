export type Role = 'superadmin' | 'admin' | 'user';

export interface User {
  uid: string;
  email: string;
  name: string | null;
  photo_url: string | null;
  role: Role;
  created_at?: string;
  last_login?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

// User Management Types
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user'; // Superadmin can only create admin or user
}

export interface UpdateRoleRequest {
  firebase_uid: string;
  new_role: 'admin' | 'user';
}

export interface UserListItem extends User {
  provider?: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}
