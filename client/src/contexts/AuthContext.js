import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    initializeDeviceId();
    checkAuthStatus();
  }, []);

  const initializeDeviceId = () => {
    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const storedDeviceId = localStorage.getItem('deviceId');
    if (token && storedDeviceId) {
      try {
        const response = await axios.get('/api/auth/verify', {
          headers: { 'x-auth-token': token }
        });
        setUser(response.data);
        setIsAuthenticated(true);
        fetchActiveSessions();
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  };

  const login = async (email, password) => {
  try {
      const response = await api.post('/auth/login', { email, password,deviceId });
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      await checkAuthStatus(); // Fetch user data after successful login
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async (logoutDeviceId = null) => {
    try {
      if (logoutDeviceId) {
        await api.post('/auth/logout', { deviceId: logoutDeviceId });
      } else {
        await api.post('/auth/logout', { deviceId });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await api.get('/auth/sessions');
      setActiveSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
    }
  };

  const logoutDevice = async (logoutDeviceId) => {
    await logout(logoutDeviceId);
    fetchActiveSessions();
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      login, 
      logout,
      checkAuthStatus,
      activeSessions,
      logoutDevice,
      deviceId
    }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);