import axios from 'axios';
import { API_URL } from '@/config/env';
import { toApiError } from '@/utils/ApiError';

export const apiService = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' }
});

let apiToken = null;

export const setApiToken = (token) => {
  apiToken = token || null;
};

apiService.interceptors.request.use(
  (config) => {
    if (apiToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${apiToken}`
      };
    }
    return config;
  },
  (error) => Promise.reject(toApiError(error))
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const shouldLogout =
      apiError?.status === 401 &&
      (apiError?.code === 'TOKEN_REVOKED' || apiError?.code === 'UNAUTHORIZED' || apiError?.message?.toLowerCase().includes('expirado'));

    if (shouldLogout && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    return Promise.reject(apiError);
  }
);
