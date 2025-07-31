// Authentication utilities for localStorage management

export interface User {
  username: string;
  loginTime: number;
}

export const AUTH_STORAGE_KEY = 'interview_practice_auth';

export function saveAuthUser(username: string): void {
  const authData: User = {
    username,
    loginTime: Date.now()
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
}

export function getAuthUser(): User | null {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;
    
    const user: User = JSON.parse(authData);
    
    // Check if session is still valid (24 hours)
    const sessionDuration = Date.now() - user.loginTime;
    const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionDuration > maxSessionDuration) {
      clearAuthUser();
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error reading auth data:', error);
    clearAuthUser();
    return null;
  }
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      saveAuthUser(username);
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Login request failed:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}