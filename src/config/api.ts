// Configuração da API
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://192.168.15.171:8080',
  endpoints: {
    accounts: '/accounts',
  },
  timeout: 10000, // 10 segundos
};

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

// Headers padrão para requisições
export const getDefaultHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
};