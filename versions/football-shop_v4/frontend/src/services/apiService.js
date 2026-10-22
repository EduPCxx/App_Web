import axios from 'axios';
import { API_URL } from '@/config/env';
import { toApiError } from '@/utils/ApiError';


export const apiService = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' }
});

// Arquitectura de auth preparada (sin implementar): AuthContext llama a setApiToken(token)
// y todas las peticiones salen con `Authorization: Bearer <token>`.
let apiToken = null;
export const setApiToken = (token) => {
  apiToken = token || null;
};

// Manejo global de errores: red, timeout, HTTP y validación del servidor llegan siempre como ApiError
apiService.interceptors.request.use(
  (config) => {
    if (apiToken) config.headers.Authorization = `Bearer ${apiToken}`;
    return config;
  },
  (error) => Promise.reject(toApiError(error))
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
);
