import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useAuthApi = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', response.data.userId);
      setToken(newToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  const authGet = useCallback((url) => {
    return axios.get(url, {
      headers: { 'x-auth-token': token }
    });
  }, [token]);

  const authPost = useCallback((url, data) => {
    return axios.post(url, data, {
      headers: { 'x-auth-token': token }
    });
  }, [token]);

  return { isAuthenticated, login, logout, authGet, authPost };
};