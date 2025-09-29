import { supabase } from '../config/database';
import { Contract } from '../models';

export class ContractRepository {
  async findAll(): Promise<Contract[]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(*),
          payments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw new Error('Failed to fetch contracts');
    }
  }

  async findById(id: string): Promise<Contract | null> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(*),
          payments(*)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching contract by ID:', error);
      throw new Error('Failed to fetch contract');
    }
  }

  async findByClientId(clientId: string): Promise<Contract[]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(*),
          payments(*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contracts by client ID:', error);
      throw new Error('Failed to fetch contracts by client ID');
    }
  }

  async create(contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    try {
      console.log('Creating contract with data:', contractData);
      const { data, error } = await supabase
        .from('contracts')
        .insert(contractData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw new Error('Failed to create contract');
    }
  }

  async update(id: string, contractData: Partial<Omit<Contract, 'id' | 'created_at' | 'updated_at'>>): Promise<Contract | null> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update(contractData)
        .eq('id', id)
        .select(`
          *,
          client:clients(*),
          payments(*)
        `)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw new Error('Failed to update contract');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw new Error('Failed to delete contract');
    }
  }

  async findByStatus(status: string): Promise<Contract[]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(*),
          payments(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contracts by status:', error);
      throw new Error('Failed to fetch contracts by status');
    }
  }
}