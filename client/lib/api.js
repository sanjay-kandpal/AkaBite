import axios from 'axios';

const createApi = () => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');
        if (token) {
          config.headers['x-auth-token'] = token;
        }
        if (deviceId) {
          config.headers['x-device-id'] = deviceId;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (typeof window !== 'undefined') {
        if (error.response && error.response.status === 401) {
          // Handle token expiration
          localStorage.removeItem('token');
          // Redirect to login page
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default createApi();
