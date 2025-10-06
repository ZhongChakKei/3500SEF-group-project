import axios, { AxiosInstance } from 'axios';
import { env } from '../utils/env';
import { useAuth } from '../context/AuthContext';

let singleton: AxiosInstance | null = null;

export function getApiClient(getToken: () => Promise<string | null>) {
  if (singleton) return singleton;
  singleton = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 10000,
  });
  singleton.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  singleton.interceptors.response.use(undefined, (error) => {
    if (error.response?.status === 401) {
      // Force re-login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  });
  return singleton;
}

// Optional hook wrapper
export function useApiClient() {
  const { getAccessToken } = useAuth();
  return getApiClient(getAccessToken);
}
