import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Add request interceptor to automatically include token from localStorage
api.interceptors.request.use(
  (config) => {
    // Always try to get token from localStorage before making request
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - clear storage
      if (typeof window !== 'undefined') {
        // Check if this is a /me endpoint call (auth check)
        const isAuthCheck = error.config?.url?.includes('/auth/me');
        
        // Only redirect if we're in admin panel (not on login/setup pages)
        if (isAuthCheck && window.location.pathname.includes('/admin/')) {
          localStorage.removeItem('accessToken');
          setAuthToken(null);
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
