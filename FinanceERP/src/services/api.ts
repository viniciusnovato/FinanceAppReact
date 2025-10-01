import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Contract, Payment, User, ApiResponse, DashboardStats } from '../types';

const API_BASE_URL = 'http://localhost:3000/api'; // Backend URL

class ApiService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('auth_token');
    console.log('🔑 Token retrieved from storage:', token ? 'Token exists' : 'No token found');
    console.log('🔑 Token length:', token?.length || 0);
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    }
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders();
    
    console.log('🌐 Making request to:', `${API_BASE_URL}${endpoint}`);
    console.log('🌐 Request headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log('🌐 Response status:', response.status);
    console.log('🌐 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🌐 Error response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🌐 Response data:', result);
    return result;
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Client methods
  async getClients(): Promise<ApiResponse<Client[]>> {
    return this.request('/clients');
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.request(`/clients/${id}`);
  }

  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Client>> {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id: string, client: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Contract methods
  async getContracts(): Promise<ApiResponse<Contract[]>> {
    return this.request('/contracts');
  }

  async getContract(id: string): Promise<ApiResponse<Contract>> {
    return this.request<Contract>(`/contracts/${id}`);
  }

  async getContractDetails(id: string): Promise<any> {
    const response = await this.request<any>(`/contracts/${id}/details`);
    return response;
  }

  async getContractsByClient(clientId: string): Promise<ApiResponse<Contract[]>> {
    return this.request<Contract[]>(`/contracts/client/${clientId}`);
  }

  async createContract(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Contract>> {
    return this.request('/contracts', {
      method: 'POST',
      body: JSON.stringify(contract),
    });
  }

  async updateContract(id: string, contract: Partial<Contract>): Promise<ApiResponse<Contract>> {
    return this.request(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contract),
    });
  }

  async deleteContract(id: string): Promise<ApiResponse<void>> {
    return this.request(`/contracts/${id}`, {
      method: 'DELETE',
    });
  }

  // Payment methods
  async getPayments(): Promise<ApiResponse<Payment[]>> {
    return this.request('/payments');
  }

  async getPaymentsPaginated(
    page: number = 1, 
    limit: number = 10, 
    filters?: {
      status?: string;
      search?: string;
      contractId?: string;
    }
  ): Promise<ApiResponse<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>> {
    let url = `/payments/paginated?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.contractId) url += `&contractId=${encodeURIComponent(filters.contractId)}`;
    }
    
    return this.request(url);
  }

  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return this.request(`/payments/${id}`);
  }

  async getPaymentsByContract(contractId: string): Promise<ApiResponse<Payment[]>> {
    return this.request(`/payments/contract/${contractId}`);
  }

  async getPaymentsByContractPaginated(
    contractId: string, 
    page: number = 1, 
    limit: number = 10,
    filters?: {
      status?: string;
      search?: string;
    }
  ): Promise<ApiResponse<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>> {
    let url = `/payments/contract/${contractId}/paginated?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    }
    
    return this.request(url);
  }

  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Payment>> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    });
  }

  async deletePayment(id: string): Promise<ApiResponse<void>> {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/dashboard/stats');
  }
}

export default new ApiService();