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

      // Debug: Log the raw payments structure
      console.log('🔍 ContractRepository: Raw payments structure:', {
        paymentsExists: !!contract.payments,
        paymentsType: typeof contract.payments,
        paymentsIsArray: Array.isArray(contract.payments),
        paymentsLength: contract.payments?.length,
        firstPayment: contract.payments?.[0] || 'No first payment'
      });

      // Log detailed payment information for debugging
      if (contract.payments && contract.payments.length > 0) {
        console.log('💰 ContractRepository: Payment details:');
        contract.payments.forEach((payment: any, index: number) => {
          console.log(`  Payment ${index + 1}:`, {
            id: payment.id,
            payment_type: payment.payment_type,
            amount: payment.amount,
            status: payment.status,
            due_date: payment.due_date
          });
        });
      } else {
        console.log('❌ ContractRepository: No payments found in contract data');
      }

      // Calculate paid percentage based on actual payments made
      const contractValue = parseFloat(contract.value || '0');
      
      // Sum all paid payments (downPayment and normalPayment only, as per new requirements)
      const paidPayments = contract.payments?.filter((payment: any) => 
        payment.status === 'paid' && 
        (payment.payment_method === 'downPayment' || 
         payment.payment_method === 'normalPayment' ||
         payment.payment_type === 'downPayment' || 
         payment.payment_type === 'normalPayment')
      ) || [];
      
      const totalPaidFromPayments = paidPayments.reduce((sum: number, payment: any) => {
        return sum + parseFloat(payment.amount || '0');
      }, 0);

      // New calculation: percentage based only on actual payments made
      const totalPaid = totalPaidFromPayments;
      const paidPercentage = contractValue > 0 ? (totalPaid / contractValue) * 100 : 0;

      // Filter payments by type
      const regularPayments = contract.payments?.filter((payment: any) => 
        payment.payment_type === 'installment' || 
        payment.payment_type === 'normalPayment' || 
        payment.payment_type === 'downPayment' ||
        !payment.payment_type
      ) || [];
      
      const complementaryPayments = contract.payments?.filter((payment: any) => 
        payment.payment_type && payment.payment_type.startsWith('comp')
      ) || [];

      const result = {
        ...contract,
        client: contract.client,
        paidPercentage: Math.round(paidPercentage * 100) / 100, // Round to 2 decimal places
        totalPaid,
        totalPaidFromPayments,
        regularPayments,
        complementaryPayments,
        paymentsSummary: {
          total: contract.payments?.length || 0,
          paid: contract.payments?.filter((p: any) => p.status === 'paid').length || 0,
          pending: contract.payments?.filter((p: any) => p.status === 'pending').length || 0,
          overdue: contract.payments?.filter((p: any) => p.status === 'overdue').length || 0,
          failed: contract.payments?.filter((p: any) => p.status === 'failed').length || 0,
          regularPaymentsCount: regularPayments.length,
          complementaryPaymentsCount: complementaryPayments.length
        }
      };

      return result;
    } catch (error) {
      console.error('❌ ContractRepository: Error fetching contract details:', error);
      throw new Error('Failed to fetch contract details');
    }
  }
}