// Configurações da API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Clientes
  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients',
    GET: (id) => `/clients/${id}`,
    UPDATE: (id) => `/clients/${id}`,
    DELETE: (id) => `/clients/${id}`,
    SEARCH: '/clients/search',
  },
  
  // Contratos
  CONTRACTS: {
    LIST: '/contracts',
    CREATE: '/contracts',
    GET: (id) => `/contracts/${id}`,
    UPDATE: (id) => `/contracts/${id}`,
    DELETE: (id) => `/contracts/${id}`,
    BY_CLIENT: (clientId) => `/contracts/client/${clientId}`,
  },
  
  // Pagamentos
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    GET: (id) => `/payments/${id}`,
    UPDATE: (id) => `/payments/${id}`,
    DELETE: (id) => `/payments/${id}`,
    BY_CONTRACT: (contractId) => `/payments/contract/${contractId}`,
    OVERDUE: '/payments/overdue',
  },
  
  // Dashboard
  DASHBOARD: {
    KPIS: '/dashboard/kpis',
    CHARTS: '/dashboard/charts',
    REVENUE: '/dashboard/revenue',
    CLIENTS_STATS: '/dashboard/clients-stats',
  },
  
  // Upload
  UPLOAD: {
    CSV: '/upload/csv',
    DOCUMENTS: '/upload/documents',
    VALIDATE_CSV: '/upload/validate-csv',
  },
};

// Status HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Chaves do AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  LANGUAGE: 'language',
};