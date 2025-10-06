import { supabase } from '../config/database';
import { Client } from '../models';

export class ClientRepository {
  async findAll(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw new Error('Failed to fetch clients');
    }
  }

  async findById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      throw new Error('Failed to fetch client');
    }
  }

  async create(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Failed to create client');
    }
  }

  async update(id: string, clientData: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error('Failed to update client');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw new Error('Failed to delete client');
    }
  }

  async findByEmail(email: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching client by email:', error);
      throw new Error('Failed to fetch client by email');
    }
  }

  async findAllWithFilters(filters: {
    search?: string;
    hasOverduePayments?: boolean;
    hasDueTodayPayments?: boolean;
  }): Promise<Client[]> {
    try {
      // Se nenhum filtro especial está ativo, usar query simples
      if (!filters.hasOverduePayments && !filters.hasDueTodayPayments) {
        let query = supabase
          .from('clients')
          .select('*');

        // Filtro de busca por nome, email ou tax_id
        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.trim();
          query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,tax_id.ilike.%${searchTerm}%`);
        }

        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Para filtros de pagamentos, usar abordagem com subquery
      const today = new Date().toISOString().split('T')[0];
      let clientIds: string[] = [];

      // Se filtro de pagamentos atrasados está ativo
      if (filters.hasOverduePayments) {
        const { data: overduePayments, error: overdueError } = await supabase
          .from('payments')
          .select(`
            contract_id,
            contracts(
              client_id
            )
          `)
          .or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`);

        if (overdueError) throw overdueError;
        
        const overdueClientIds = overduePayments?.map(p => (p.contracts as any)?.client_id).filter(id => id) || [];
        clientIds = [...clientIds, ...overdueClientIds];
      }

      // Se filtro de pagamentos vencendo hoje está ativo
      if (filters.hasDueTodayPayments) {
        const { data: dueTodayPayments, error: dueTodayError } = await supabase
          .from('payments')
          .select(`
            contract_id,
            contracts(
              client_id
            )
          `)
          .eq('status', 'pending')
          .eq('due_date', today);

        if (dueTodayError) throw dueTodayError;
        
        const dueTodayClientIds = dueTodayPayments?.map(p => (p.contracts as any)?.client_id).filter(id => id) || [];
        clientIds = [...clientIds, ...dueTodayClientIds];
      }

      // Remover duplicatas
      const uniqueClientIds = [...new Set(clientIds)];

      if (uniqueClientIds.length === 0) {
        return [];
      }

      // Buscar os clientes pelos IDs encontrados
      let query = supabase
        .from('clients')
        .select('*')
        .in('id', uniqueClientIds);

      // Filtro de busca por nome, email ou tax_id
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,tax_id.ilike.%${searchTerm}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching clients with filters:', error);
      throw new Error('Failed to fetch clients with filters');
    }
  }
}