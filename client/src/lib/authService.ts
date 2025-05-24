// This service now interacts with the backend Express API.
// Ensure the RoleEnum from shared/schema is consistent or map roles if needed.
import { RoleEnum } from '@/shared/schema'; // Assuming RoleEnum is available

const API_BASE_URL = '/api'; // Assuming your Express server is proxying /api

export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: RoleEnum | string; // Use RoleEnum if possible, or string if roles are dynamic
  avatar?: string;
  // Add other user properties returned by your API
  [key: string]: any; 
}

export interface Session {
  user: User | null;
  // Token is now handled by httpOnly cookie, so not directly exposed to client JS
}

// Helper to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'API request failed');
  }
  // For 204 No Content, response.json() will fail.
  if (response.status === 204) {
    return null; 
  }
  return response.json();
};

export const login = async (email?: string, password?: string): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const user = await handleApiResponse(response);
    _notifyAuthStateChange('SIGNED_IN', { user }); // Notify listeners
    return { user, error: null };
  } catch (error: any) {
    console.error('authService.login error:', error);
    return { user: null, error };
  }
};

export const logout = async (): Promise<{ error: Error | null }> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    _notifyAuthStateChange('SIGNED_OUT', null); // Notify listeners
    return { error: null };
  } catch (error: any) {
    console.error('authService.logout error:', error);
    // Even if API call fails, client should proceed with logout
    _notifyAuthStateChange('SIGNED_OUT', null);
    return { error }; // Return error but still notify for client-side state update
  }
};

export const register = async (email?: string, password?: string, metadata?: { name?: string, role?: RoleEnum | string }): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: metadata?.name, role: metadata?.role }),
    });
    const user = await handleApiResponse(response);
    // Typically, registration doesn't auto-login, but if it does:
    // _notifyAuthStateChange('USER_REGISTERED_AND_SIGNED_IN', { user });
    return { user, error: null };
  } catch (error: any) {
    console.error('authService.register error:', error);
    return { user: null, error };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 401) return null; // Not authorized means no user
    const user = await handleApiResponse(response);
    return user;
  } catch (error) {
    console.error('authService.getCurrentUser error:', error);
    // Don't treat network errors or other issues as "no user", let it propagate or return null
    return null; 
  }
};

export const getSession = async (): Promise<Session | null> => {
  // With httpOnly cookies, the client cannot directly access the session/token.
  // We rely on getCurrentUser to determine if there's an active session.
  console.log('authService.getSession: Attempting to get current user to determine session status.');
  try {
    const user = await getCurrentUser();
    if (user) {
      console.log('authService.getSession: User found, creating session object.');
      return { user };
    }
    console.log('authService.getSession: No user found, returning null session.');
    return null;
  } catch (error) {
    console.error('authService.getSession error while calling getCurrentUser:', error);
    return null;
  }
};

export const resetPassword = async (email?: string): Promise<{ error: Error | null }> => {
  console.warn('authService.resetPassword: Not fully implemented with backend yet. Needs API endpoint.');
  // Placeholder for future API call:
  // try {
  //   await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email }),
  //   });
  //   return { error: null };
  // } catch (error: any) {
  //   return { error };
  // }
  if (!email) return Promise.resolve({ error: new Error('Email is required for password reset (mock).') });
  console.log(`Mock password reset request for ${email}`);
  return Promise.resolve({ error: null });
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<{ user: User | null; error: Error | null }> => {
  console.warn('authService.updateUser: Not fully implemented with backend yet. Needs API endpoint.');
  // Placeholder for future API call:
  // try {
  //   const response = await fetch(`${API_BASE_URL}/users/${userId}`, { // Assuming a /api/users/:id endpoint
  //     method: 'PUT', // or PATCH
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(userData),
  //   });
  //   const updatedUser = await handleApiResponse(response);
  //   return { user: updatedUser, error: null };
  // } catch (error: any) {
  //   return { user: null, error };
  // }
  if (!userId) return Promise.resolve({ user: null, error: new Error('User ID is required (mock).') });
  console.log(`Mock user update for ${userId} with data:`, userData);
  // Simulate a successful update by returning the modified data (client-side only)
  const mockUpdatedUser = { id: userId, name: 'Updated Mock User', email: 'updated@example.com', ...userData };
  return Promise.resolve({ user: mockUpdatedUser as User, error: null });
};


type AuthStateChangeCallback = (event: string, session: Session | null) => void;
let authStateChangeListeners: AuthStateChangeCallback[] = [];

export const onAuthStateChange = (callback: AuthStateChangeCallback): { unsubscribe: () => void } => {
  authStateChangeListeners.push(callback);
  
  // Optionally, immediately call with current session status
  // getSession().then(session => callback('INITIAL_STATE_CHECK', session));
  
  return {
    unsubscribe: () => {
      authStateChangeListeners = authStateChangeListeners.filter(listener => listener !== callback);
    },
  };
};

// Helper function to notify all listeners of auth state changes
export const _notifyAuthStateChange = (event: string, session: Session | null) => {
  console.log(`Notifying auth state change: ${event}, session user:`, session?.user?.name || 'none');
  authStateChangeListeners.forEach(listener => listener(event, session));
};
