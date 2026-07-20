import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // required for httpOnly refreshToken cookie
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// ─── Request interceptor ────────────────────────────────────────────────────
// Always attach the latest accessToken from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Token refresh state ─────────────────────────────────────────────────────
// Track an in-progress refresh to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

// ─── Response interceptor ────────────────────────────────────────────────────
// On 401: silently call /api/auth/refresh (uses httpOnly cookie), update the
// accessToken in localStorage, then replay the original failed request.
// Only redirect to /login if the refresh itself fails (truly expired session).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const isRefreshEndpoint = originalRequest?.url?.includes('/api/auth/refresh');
    const isLoginEndpoint = originalRequest?.url?.includes('/api/auth/login');

    // Don't try to refresh on the refresh or login endpoints themselves
    if (isRefreshEndpoint || isLoginEndpoint) {
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh is done
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Mark this request as retried so we don't loop
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint — cookie is sent automatically (withCredentials: true)
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }

        // Persist new token
        localStorage.setItem('accessToken', newAccessToken);
        setAuthToken(newAccessToken);

        // Notify all queued requests
        onTokenRefreshed(newAccessToken);
        isRefreshing = false;

        // Replay the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → session truly expired → force logout
        isRefreshing = false;
        refreshSubscribers = [];

        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          setAuthToken(null);

          // Only redirect if already in admin panel (not login page)
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
