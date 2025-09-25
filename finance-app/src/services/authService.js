import apiClient, { makeRequest } from './api';
import { API_ENDPOINTS } from '../constants/api';

export const authService = {
  // Login
  login: async (email, password) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      })
    );
  },

  // Registro
  register: async (userData) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    );
  },

  // Logout
  logout: async () => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    );
  },

  // Obter perfil do usuário
  getProfile: async () => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.AUTH.PROFILE)
    );
  },

  // Atualizar perfil
  updateProfile: async (userData) => {
    return makeRequest(() =>
      apiClient.put(API_ENDPOINTS.AUTH.PROFILE, userData)
    );
  },

  // Renovar token
  refreshToken: async (refreshToken) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      })
    );
  },

  // Esqueci minha senha
  forgotPassword: async (email) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      })
    );
  },

  // Redefinir senha
  resetPassword: async (token, newPassword) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      })
    );
  },

  // Validar token
  validateToken: async () => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.AUTH.PROFILE)
    );
  },
};