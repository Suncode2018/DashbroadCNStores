import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import config from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Check for existing token on app start
  useEffect(() => {
    const token = localStorage.getItem(config.tokenKey);
    if (token) {
      // Verify token with backend (optional)
      // For now, just set a mock user
      setUser({
        name: 'User',
        email: 'user@company.com',
        role: 'Manager',
        avatar: 'U',
      });
    }
    setInitialized(true);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      if (config.isDevelopment) {
        // Mock login for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userData = {
          name: credentials.username,
          email: `${credentials.username}@company.com`,
          role: 'Manager',
          avatar: credentials.username.charAt(0).toUpperCase(),
        };
        
        // Store mock token
        localStorage.setItem(config.tokenKey, 'mock-jwt-token');
        setUser(userData);
        return { success: true, user: userData };
      } else {
        // Real API call for production
        const response = await apiService.login(credentials);
        
        if (response.success) {
          const { user, token } = response.data;
          localStorage.setItem(config.tokenKey, token);
          setUser(user);
          return { success: true, user };
        } else {
          return { success: false, error: response.error };
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'เข้าสู่ระบบไม่สำเร็จ' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (!config.isDevelopment) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(config.tokenKey);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};