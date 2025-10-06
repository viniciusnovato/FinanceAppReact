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
  }): Promise<Client[]> {
    try {
      let query = supabase
        .from('clients')
        .select('*');

      // Se filtro de pagamentos atrasados está ativo
      if (filters.hasOverduePayments) {
        // Buscar clientes que têm pagamentos com status 'overdue' ou 
        // pagamentos 'pending' com due_date anterior à data atual
        const today = new Date().toISOString().split('T')[0];
        
        query = supabase
          .from('clients')
          .select(`
            *,
            contracts!inner(
              id,
              payments!inner(
                id,
                status,
                due_date
              )
            )
          `)
          .or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`, { foreignTable: 'contracts.payments' });
      }

      // Filtro de busca por nome, email ou tax_id
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,tax_id.ilike.%${searchTerm}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Se filtro de pagamentos atrasados está ativo, precisamos remover duplicatas
      // pois um cliente pode ter múltiplos pagamentos atrasados
      if (filters.hasOverduePayments && data) {
        const uniqueClients = data.reduce((acc: Client[], current: any) => {
          const existingClient = acc.find(client => client.id === current.id);
          if (!existingClient) {
            // Remove as propriedades de relacionamento antes de adicionar
            const { contracts, ...clientData } = current;
            acc.push(clientData);
          }
          return acc;
        }, []);
        return uniqueClients;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching clients with filters:', error);
      throw new Error('Failed to fetch clients with filters');
    }
  }
}