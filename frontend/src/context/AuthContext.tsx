import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '../types';
import { signalRService } from '../services/signalrService';

interface AuthContextType {
  user: User | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return { ...parsed, token };
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user?.token) {
      signalRService.startConnection(user.token);
    } else {
      signalRService.stopConnection();
    }
  }, [user]);

  const login = (data: LoginResponse) => {
    const userData: User = {
      username: data.username,
      role: data.role,
      linkedEntityId: data.linkedEntityId,
      entityName: data.entityName,
      signalLocation: data.signalLocation,
      token: data.token,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    signalRService.stopConnection();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
