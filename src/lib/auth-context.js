'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { clearUser, getCurrentUser } from '@/lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        // Check for user data in localStorage or sessionStorage
        if (typeof window !== 'undefined') {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking user:', error);
        setLoading(false);
      }
    };

    checkUser();
    
    // Listen for storage changes (in case user logs in from another tab)
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const userData = getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Store user data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(userData),
        url: window.location.href
      }));
    }
  };

  const logout = () => {
    setUser(null);
    // Clear user data from storage
    clearUser();
    // Dispatch storage event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: null,
        url: window.location.href
      }));
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isClient: typeof window !== 'undefined'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}