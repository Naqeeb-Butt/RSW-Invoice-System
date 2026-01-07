import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import logger from '../utils/logger';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    const userEmail = user?.email || 'unknown';
    logger.info('User logging out', { email: userEmail });
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    logger.logAuthEvent('LOGOUT', true, userEmail);
  }, [user]);

  const fetchUser = useCallback(async () => {
    try {
      logger.debug('Fetching current user');
      const response = await axios.get('/api/v1/auth/me-simple');
      setUser(response.data);
      setError(null);
      logger.info('User fetched successfully', { userId: response.data.id, email: response.data.email });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user', { error: error.message, status: error.response?.status });
      setError(error.response?.data?.detail || 'Failed to fetch user');
      return null;
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Login attempt started', { email, timestamp: new Date().toISOString() });
      
      // Validate form inputs
      if (!email || !password) {
        const errorMsg = !email ? 'Email is required' : 'Password is required';
        logger.error('Validation failed', { email: !!email, password: !!password, error: errorMsg });
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      if (!email.includes('@')) {
        logger.error('Invalid email format', { email });
        setError('Please enter a valid email address');
        setLoading(false);
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        logger.error('Password too short', { passwordLength: password.length });
        setError('Password must be at least 6 characters');
        setLoading(false);
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      
      logger.info('Making API call to login endpoint', { 
        endpoint: '/api/v1/auth/login',
        apiUrl: process.env.REACT_APP_API_URL || 'default',
        timestamp: new Date().toISOString()
      });
      
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post('/api/v1/auth/login', formData);
      logger.info('Login API response received', { 
        status: response.status,
        hasToken: !!response.data?.access_token,
        timestamp: new Date().toISOString()
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      logger.info('Token stored and headers set', { tokenLength: access_token?.length });
      
      const userData = await fetchUser();
      logger.logAuthEvent('LOGIN', true, email);
      
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        timestamp: new Date().toISOString()
      };
      
      logger.error('Login failed with detailed error', errorDetails);
      setError(errorMessage);
      logger.logAuthEvent('LOGIN', false, email, error);
      setLoading(false);
      return { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      };
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
      logger.info('No token found, user not authenticated');
    }
  }, [fetchUser]);

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    clearError,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
