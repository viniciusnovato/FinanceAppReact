import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS, HTTP_STATUS } from '../constants/api';

// Criar instância do Axios
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao recuperar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o token expirou (401) e não é uma tentativa de refresh
    if (
      error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          const { token } = response.data;
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

          // Repetir a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Se falhar ao renovar, limpar dados e redirecionar para login
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        
        // Aqui você pode adicionar lógica para redirecionar para login
        // Por exemplo, usando navigation ou um event emitter
        console.warn('Sessão expirada, redirecionando para login');
      }
    }

    return Promise.reject(error);
  }
);

// Função para tratar erros de API
export const handleApiError = (error) => {
  if (error.response) {
    // Erro com resposta do servidor
    const { status, data } = error.response;
    
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return data.message || 'Dados inválidos';
      case HTTP_STATUS.UNAUTHORIZED:
        return 'Não autorizado. Faça login novamente.';
      case HTTP_STATUS.FORBIDDEN:
        return 'Acesso negado';
      case HTTP_STATUS.NOT_FOUND:
        return 'Recurso não encontrado';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Erro interno do servidor';
      default:
        return data.message || 'Erro desconhecido';
    }
  } else if (error.request) {
    // Erro de rede
    return 'Erro de conexão. Verifique sua internet.';
  } else {
    // Erro na configuração da requisição
    return 'Erro na requisição';
  }
};

// Função para fazer requisições com tratamento de erro
export const makeRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return { data: response.data, error: null };
  } catch (error) {
    const errorMessage = handleApiError(error);
    return { data: null, error: errorMessage };
  }
};

export default apiClient;