import apiClient, { makeRequest } from './api';
import { API_ENDPOINTS } from '../constants/api';

export const dashboardService = {
  // Obter KPIs do dashboard
  getKPIs: async () => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.DASHBOARD.KPIS)
    );
  },

  // Obter dados para gráficos
  getCharts: async (period = '12months') => {
    return makeRequest(() =>
      apiClient.get(`${API_ENDPOINTS.DASHBOARD.CHARTS}?period=${period}`)
    );
  },

  // Obter dados de receita
  getRevenue: async (startDate, endDate) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    return makeRequest(() =>
      apiClient.get(`${API_ENDPOINTS.DASHBOARD.REVENUE}?${params}`)
    );
  },

  // Obter estatísticas de clientes
  getClientsStats: async () => {
    return makeRequest(() =>
      apiClient.get(API_ENDPOINTS.DASHBOARD.CLIENTS_STATS)
    );
  },
};