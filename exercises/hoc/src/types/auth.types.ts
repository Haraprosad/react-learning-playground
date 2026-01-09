export type Role = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
