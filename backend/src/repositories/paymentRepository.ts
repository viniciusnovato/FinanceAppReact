import { supabase } from '../config/database';
import { Payment } from '../models';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaymentFilters {
  status?: string;
  search?: string;
  contractId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaymentRepository {
  async findAll(): Promise<Payment[]> {
    try {
      // Para manter compatibilidade, vamos buscar todos os pagamentos usando paginação
      const allPayments: Payment[] = [];
      let page = 1;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const result = await this.findAllPaginated({ page, limit });
        allPayments.push(...result.data);
        hasMore = result.hasNextPage;
        page++;
      }

      return allPayments;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw new Error('Failed to fetch payments');
    }
  }

  async findAllPaginated(options: PaginationOptions = {}, filters: PaymentFilters = {}): Promise<PaginatedResult<Payment>> {
    try {
      const { page = 1, limit = 50 } = options;
      const { status, search, contractId } = filters;
      const offset = (page - 1) * limit;

      // Construir query base
      let countQuery = supabase.from('payments').select('*', { count: 'exact', head: true });
      let dataQuery = supabase
        .from('payments')
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `);

      // Aplicar filtros
      if (status) {
        countQuery = countQuery.eq('status', status);
        dataQuery = dataQuery.eq('status', status);
      }

      if (contractId) {
        countQuery = countQuery.eq('contract_id', contractId);
        dataQuery = dataQuery.eq('contract_id', contractId);
      }

      if (search) {
        // Buscar por descrição ou valor
        const searchFilter = `description.ilike.%${search}%,amount.eq.${parseFloat(search) || 0}`;
        countQuery = countQuery.or(searchFilter);
        dataQuery = dataQuery.or(searchFilter);
      }

      // Executar query de contagem
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Executar query de dados com paginação
      const { data, error } = await dataQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data || [],
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      console.error('Error fetching paginated payments:', error);
      throw new Error('Failed to fetch paginated payments');
    }
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching payment by ID:', error);
      throw new Error('Failed to fetch payment');
    }
  }

  async findByContractId(contractId: string): Promise<Payment[]> {
    try {
      // Para contratos específicos, vamos buscar todos os pagamentos usando paginação
      const allPayments: Payment[] = [];
      let page = 1;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const result = await this.findByContractIdPaginated(contractId, { page, limit });
        allPayments.push(...result.data);
        hasMore = result.hasNextPage;
        page++;
      }

      return allPayments;
    } catch (error) {
      console.error('Error fetching payments by contract ID:', error);
      throw new Error('Failed to fetch payments by contract ID');
    }
  }

  async findByContractIdPaginated(contractId: string, options: PaginationOptions = {}, filters: PaymentFilters = {}): Promise<PaginatedResult<Payment>> {
    try {
      const { page = 1, limit = 50 } = options;
      const { status, search } = filters;
      const offset = (page - 1) * limit;

      // Construir query base para contagem
      let countQuery = supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('contract_id', contractId);

      // Construir query base para dados
      let dataQuery = supabase
        .from('payments')
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .eq('contract_id', contractId);

      // Aplicar filtros
      if (status) {
        countQuery = countQuery.eq('status', status);
        dataQuery = dataQuery.eq('status', status);
      }

      if (search) {
        const searchFilter = `description.ilike.%${search}%,amount.eq.${parseFloat(search) || 0}`;
        countQuery = countQuery.or(searchFilter);
        dataQuery = dataQuery.or(searchFilter);
      }

      // Executar query de contagem
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Executar query de dados com paginação
      const { data, error } = await dataQuery
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data || [],
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      console.error('Error fetching paginated payments by contract ID:', error);
      throw new Error('Failed to fetch paginated payments by contract ID');
    }
  }

  async create(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  async update(id: string, paymentData: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', id)
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw new Error('Failed to update payment');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw new Error('Failed to delete payment');
    }
  }

  async findByStatus(status: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .eq('status', status)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments by status:', error);
      throw new Error('Failed to fetch payments by status');
    }
  }

  async findOverduePayments(): Promise<Payment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .eq('status', 'pending')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      throw new Error('Failed to fetch overdue payments');
    }
  }

  async markAsPaid(id: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paidDate: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          contract:contracts(
            *,
            client:clients(*)
          )
        `)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw new Error('Failed to mark payment as paid');
    }
  }

  /**
   * Remove todos os pagamentos de um contrato específico
   */
  async deleteByContractId(contractId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('contract_id', contractId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting payments by contract ID:', error);
      throw new Error('Failed to delete payments by contract ID');
    }
  }
}