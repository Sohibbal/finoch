export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
