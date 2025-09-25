import apiClient, { makeRequest } from './api';
import { API_ENDPOINTS } from '../constants/api';

export const contractService = {
  // Listar contratos
  getContracts: async (page = 1, limit = 20, clientId = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(clientId && { clientId }),
    });

    return makeRequest(() =>
      apiClient.get(`${API_ENDPOINTS.CONTRACTS.LIST}?${params}`)
    );
  },

  // Obter contrato por ID
  getContract: async (id) => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.CONTRACTS.GET(id))
    );
  },

  // Criar contrato
  createContract: async (contractData) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.CONTRACTS.CREATE, contractData)
    );
  },

  // Atualizar contrato
  updateContract: async (id, contractData) => {
    return makeRequest(() =>
      apiClient.put(API_ENDPOINTS.CONTRACTS.UPDATE(id), contractData)
    );
  },

  // Deletar contrato
  deleteContract: async (id) => {
    return makeRequest(() =>
      apiClient.delete(API_ENDPOINTS.CONTRACTS.DELETE(id))
    );
  },

  // Obter contratos por cliente
  getContractsByClient: async (clientId) => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.CONTRACTS.BY_CLIENT(clientId))
    );
  },
};