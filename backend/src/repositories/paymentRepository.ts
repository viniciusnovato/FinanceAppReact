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
  // Date filters
  due_date_from?: string;
  due_date_to?: string;
  paid_date_from?: string;
  paid_date_to?: string;
  created_at_from?: string;
  created_at_to?: string;
  // Amount filters
  amount_min?: number;
  amount_max?: number;
  // Payment method and type
  payment_method?: string;
  payment_type?: string;
  // Contract filters
  contract_number?: string;
  contract_status?: string;
  // Client filters
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  tax_id?: string;
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
      const { 
        status, 
        search, 
        contractId,
        due_date_from,
        due_date_to,
        paid_date_from,
        paid_date_to,
        created_at_from,
        created_at_to,
        amount_min,
        amount_max,
        payment_method,
        payment_type,
        contract_number,
        contract_status,
        client_name,
        client_email,
        client_phone,
        tax_id
      } = filters;
      const offset = (page - 1) * limit;

      // Construir query base com joins para permitir filtros cruzados
      let countQuery = supabase
        .from('payments')
        .select(`
          *,
          contract:contracts!inner(
            *,
            client:clients!inner(*)
          )
        `, { count: 'exact', head: true });
      
      let dataQuery = supabase
        .from('payments')
        .select(`
          *,
          contract:contracts!inner(
            *,
            client:clients!inner(*)
          )
        `);

      // Aplicar filtros de pagamento
      if (status) {
        countQuery = countQuery.eq('status', status);
        dataQuery = dataQuery.eq('status', status);
      }

      if (contractId) {
        countQuery = countQuery.eq('contract_id', contractId);
        dataQuery = dataQuery.eq('contract_id', contractId);
      }

      // Filtros de data
      if (due_date_from) {
        countQuery = countQuery.gte('due_date', due_date_from);
        dataQuery = dataQuery.gte('due_date', due_date_from);
      }

      if (due_date_to) {
        countQuery = countQuery.lte('due_date', due_date_to);
        dataQuery = dataQuery.lte('due_date', due_date_to);
      }

      if (paid_date_from) {
        countQuery = countQuery.gte('paid_date', paid_date_from);
        dataQuery = dataQuery.gte('paid_date', paid_date_from);
      }

      if (paid_date_to) {
        countQuery = countQuery.lte('paid_date', paid_date_to);
        dataQuery = dataQuery.lte('paid_date', paid_date_to);
      }

      if (created_at_from) {
        countQuery = countQuery.gte('created_at', created_at_from);
        dataQuery = dataQuery.gte('created_at', created_at_from);
      }

      if (created_at_to) {
        countQuery = countQuery.lte('created_at', created_at_to);
        dataQuery = dataQuery.lte('created_at', created_at_to);
      }

      // Filtros de valor
      if (amount_min !== undefined) {
        countQuery = countQuery.gte('amount', amount_min);
        dataQuery = dataQuery.gte('amount', amount_min);
      }

      if (amount_max !== undefined) {
        countQuery = countQuery.lte('amount', amount_max);
        dataQuery = dataQuery.lte('amount', amount_max);
      }

      // Filtros de método e tipo de pagamento
      if (payment_method) {
        countQuery = countQuery.eq('payment_method', payment_method);
        dataQuery = dataQuery.eq('payment_method', payment_method);
      }

      if (payment_type) {
        countQuery = countQuery.eq('payment_type', payment_type);
        dataQuery = dataQuery.eq('payment_type', payment_type);
      }

      // Filtros de contrato
      if (contract_number) {
        countQuery = countQuery.eq('contracts.contract_number', contract_number);
        dataQuery = dataQuery.eq('contracts.contract_number', contract_number);
      }

      if (contract_status) {
        countQuery = countQuery.eq('contracts.status', contract_status);
        dataQuery = dataQuery.eq('contracts.status', contract_status);
      }

      // Filtros de cliente
      if (client_name) {
        const nameFilter = `contracts.clients.first_name.ilike.%${client_name}%,contracts.clients.last_name.ilike.%${client_name}%`;
        countQuery = countQuery.or(nameFilter);
        dataQuery = dataQuery.or(nameFilter);
      }

      if (client_email) {
        countQuery = countQuery.ilike('contracts.clients.email', `%${client_email}%`);
        dataQuery = dataQuery.ilike('contracts.clients.email', `%${client_email}%`);
      }

      if (client_phone) {
        countQuery = countQuery.ilike('contracts.clients.phone', `%${client_phone}%`);
        dataQuery = dataQuery.ilike('contracts.clients.phone', `%${client_phone}%`);
      }

      if (tax_id) {
        countQuery = countQuery.eq('contracts.clients.tax_id', tax_id);
        dataQuery = dataQuery.eq('contracts.clients.tax_id', tax_id);
      }

      // Busca geral (mantendo compatibilidade)
      if (search) {
        const searchFilter = `description.ilike.%${search}%,amount.eq.${parseFloat(search) || 0},contracts.contract_number.ilike.%${search}%,contracts.clients.first_name.ilike.%${search}%,contracts.clients.last_name.ilike.%${search}%`;
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