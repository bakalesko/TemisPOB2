// API configuration utility
const getApiBaseUrl = () => {
  // Check if running on Vercel domain
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://temispob.vercel.app';
  }
  
  // In production, use the Vercel domain
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_APP_URL || 'https://temispob.vercel.app';
  }
  
  // In development, use relative URLs (handled by Vite dev server proxy)
  return '';
};

export const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

export const API_BASE_URL = getApiBaseUrl();