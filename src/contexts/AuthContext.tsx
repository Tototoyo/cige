/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import {User} from '../types';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'cinegen-ai-user';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    const email = window.prompt(
      'To see your history, please sign in.\nEnter your email address:',
    );
    if (email && email.includes('@')) {
      // Basic validation
      const newUser: User = {email: email.toLowerCase().trim()};
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      window.alert(
        `Successfully signed in as ${newUser.email}. You can now access your history.`,
      );
    } else if (email) {
      window.alert('Please enter a valid email address.');
    }
  }, []);

  const logout = useCallback(() => {
    if (window.confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{user, login, logout, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
