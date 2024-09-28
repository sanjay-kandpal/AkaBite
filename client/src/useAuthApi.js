import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAuthApi = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setToken(token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
  };

  const authGet = (url) => {
    return axios.get(url, {
      headers: { 'x-auth-token': token }
    });
  };

  const authPost = (url, data) => {
    return axios.post(url, data, {
      headers: { 'x-auth-token': token }
    });
  };

  return { token, login, logout, authGet, authPost };
};