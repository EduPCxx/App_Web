import axios from 'axios';
import { API_URL } from '@/config/env';
import { toApiError } from '@/utils/ApiError';

export const apiService = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' }
});

apiService.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
);
