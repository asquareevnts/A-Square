import { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl } from '../config/api';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'event-platform-user';
const AUTH_EVENT = 'auth-changed';

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredUser(userData) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!userData) {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } else {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }

  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    // Check for OAuth redirect data in URL first
    const params = new URLSearchParams(window.location.search);
    const authData = params.get('authUser');
    if (authData) {
      try {
        const userData = JSON.parse(atob(authData.replace(/-/g, '+').replace(/_/g, '/')));
        setUser(userData);
        writeStoredUser(userData);
        // Clean up URL without reload
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse auth data from URL:', e);
      }
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(buildApiUrl('/auth/me'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          writeStoredUser(data.user);
          return;
        }
      }

      setUser(null);
      writeStoredUser(null);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    writeStoredUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(buildApiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      writeStoredUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
