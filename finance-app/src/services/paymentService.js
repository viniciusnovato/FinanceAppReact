import apiClient, { makeRequest } from './api';
import { API_ENDPOINTS } from '../constants/api';

export const paymentService = {
  // Listar pagamentos
  getPayments: async (page = 1, limit = 20, contractId = null, status = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(contractId && { contractId }),
      ...(status && { status }),
    });

    return makeRequest(() =>
      apiClient.get(`${API_ENDPOINTS.PAYMENTS.LIST}?${params}`)
    );
  },

  // Obter pagamento por ID
  getPayment: async (id) => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.PAYMENTS.GET(id))
    );
  },

  // Criar pagamento
  createPayment: async (paymentData) => {
    return makeRequest(() =>
      apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, paymentData)
    );
  },

  // Atualizar pagamento
  updatePayment: async (id, paymentData) => {
    return makeRequest(() =>
      apiClient.put(API_ENDPOINTS.PAYMENTS.UPDATE(id), paymentData)
    );
  },

  // Deletar pagamento
  deletePayment: async (id) => {
    return makeRequest(() =>
      apiClient.delete(API_ENDPOINTS.PAYMENTS.DELETE(id))
    );
  },

  // Obter pagamentos por contrato
  getPaymentsByContract: async (contractId) => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.PAYMENTS.BY_CONTRACT(contractId))
    );
  },

  // Obter pagamentos em atraso
  getOverduePayments: async () => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.PAYMENTS.OVERDUE)
    );
  },
};