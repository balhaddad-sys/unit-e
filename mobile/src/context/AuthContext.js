/**
 * Authentication Context
 * Manages user authentication state and operations
 */

import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';
import {login as apiLogin, register as apiRegister, logout as apiLogout} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (userData && token) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);

      if (response.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        await AsyncStorage.setItem('authToken', response.token);

        setUser(response.user);
        setIsAuthenticated(true);

        showMessage({
          message: 'Login Successful',
          description: `Welcome back, ${response.user.name}!`,
          type: 'success',
        });

        return {success: true};
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      showMessage({
        message: 'Login Failed',
        description: error.message || 'Please check your credentials',
        type: 'danger',
      });
      return {success: false, error: error.message};
    }
  };

  const register = async (name, email, password, role = 'doctor') => {
    try {
      const response = await apiRegister(name, email, password, role);

      if (response.success) {
        showMessage({
          message: 'Registration Successful',
          description: 'Please login with your credentials',
          type: 'success',
        });

        return {success: true};
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      showMessage({
        message: 'Registration Failed',
        description: error.message,
        type: 'danger',
      });
      return {success: false, error: error.message};
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');

      setUser(null);
      setIsAuthenticated(false);

      showMessage({
        message: 'Logged Out',
        description: 'You have been logged out successfully',
        type: 'info',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
