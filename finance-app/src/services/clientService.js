import apiClient, { makeRequest } from './api';
import { API_ENDPOINTS } from '../constants/api';

export const clientService = {
  // Listar clientes
  getClients: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    return makeRequest(() =>
      apiClient.get(`${API_ENDPOINTS.CLIENTS.LIST}?${params}`)
    );
  },

  // Obter cliente por ID
  getClient: async (id) => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.CLIENTS.GET(id))
    );
  },

  // Criar cliente
  createClient: async (clientData) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.CLIENTS.CREATE, clientData)
    );
  },

  // Atualizar cliente
  updateClient: async (id, clientData) => {
    return makeRequest(() =>
      apiClient.put(API_ENDPOINTS.CLIENTS.UPDATE(id), clientData)
    );
  },

  // Deletar cliente
  deleteClient: async (id) => {
    return makeRequest(() =>
      apiClient.delete(API_ENDPOINTS.CLIENTS.DELETE(id))
    );
  },

  // Buscar clientes
  searchClients: async (query) => {
    return makeRequest(() =>
      apiClient.get(`${API_ENDPOINTS.CLIENTS.SEARCH}?q=${encodeURIComponent(query)}`)
    );
  },
};