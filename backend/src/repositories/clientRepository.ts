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
}