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

  async findContractDetails(id: string): Promise<any> {
    try {
      console.log('🔍 ContractRepository: Finding contract details for ID:', id);
      
      // Get contract with client and all payments
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients(*),
          payments(*)
        `)
        .eq('id', id)
        .single();

      console.log('📊 ContractRepository: Supabase query result:', { contract, contractError });

      if (contractError && contractError.code !== 'PGRST116') {
        console.error('❌ ContractRepository: Supabase error:', contractError);
        throw contractError;
      }
      
      if (!contract) {
        console.log('❌ ContractRepository: Contract not found for ID:', id);
        return null;
      }

      console.log('✅ ContractRepository: Contract found:', {
        id: contract.id,
        contract_number: contract.contract_number,
        client: contract.client,
        paymentsCount: contract.payments?.length || 0
      });

      // Calculate paid percentage
      const downPayment = parseFloat(contract.down_payment || '0');
      const contractValue = parseFloat(contract.value || '0');
      
      // Sum all paid payments (including complementary payments)
      const paidPayments = contract.payments?.filter((payment: any) => payment.status === 'paid') || [];
      const totalPaidFromPayments = paidPayments.reduce((sum: number, payment: any) => {
        return sum + parseFloat(payment.amount || '0');
      }, 0);

      const totalPaid = downPayment + totalPaidFromPayments;
      const paidPercentage = contractValue > 0 ? (totalPaid / contractValue) * 100 : 0;

      // Organize payments by type
      const regularPayments = contract.payments?.filter((payment: any) => 
        !payment.payment_type || payment.payment_type === 'installment'
      ) || [];
      
      const complementaryPayments = contract.payments?.filter((payment: any) => 
        payment.payment_type && payment.payment_type.startsWith('comp')
      ) || [];

      const result = {
        ...contract,
        paidPercentage: Math.round(paidPercentage * 100) / 100, // Round to 2 decimal places
        totalPaid,
        totalPaidFromPayments,
        regularPayments,
        complementaryPayments,
        paymentsSummary: {
          total: contract.payments?.length || 0,
          paid: paidPayments.length,
          pending: contract.payments?.filter((payment: any) => payment.status === 'pending').length || 0,
          overdue: contract.payments?.filter((payment: any) => payment.status === 'overdue').length || 0,
          failed: contract.payments?.filter((payment: any) => payment.status === 'failed').length || 0
        }
      };

      console.log('✅ ContractRepository: Returning contract details:', {
        id: result.id,
        paidPercentage: result.paidPercentage,
        totalPaid: result.totalPaid,
        paymentsSummary: result.paymentsSummary
      });

      return result;
    } catch (error) {
      console.error('❌ ContractRepository: Error fetching contract details:', error);
      throw new Error('Failed to fetch contract details');
    }
  }
}