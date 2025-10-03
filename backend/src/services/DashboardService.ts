import { supabase } from '../config/database';

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalContracts: number;
  activeContracts: number;
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  paymentsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export class DashboardService {
  /**
   * Obter estatísticas do dashboard
   */
  async getStats(): Promise<DashboardStats> {
    try {
      // Executar todas as consultas em paralelo para melhor performance
      const [
        clientsResult,
        activeClientsResult,
        contractsResult,
        activeContractsResult,
        paymentsResult,
        contractsValueResult,
        pendingPaymentsResult,
        overduePaymentsResult,
        monthlyRevenue,
        paymentsByStatus
      ] = await Promise.all([
        // Total de clientes
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true }),
        
        // Clientes ativos
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo'),
        
        // Total de contratos
        supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true }),
        
        // Contratos ativos
        supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Ativo'),
        
        // Total de pagamentos
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true }),
        
        // Receita total (soma dos valores dos contratos)
        supabase
          .from('contracts')
          .select('value'),
        
        // Pagamentos pendentes
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        
        // Pagamentos em atraso
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'overdue'),
        
        // Receita mensal
        this.getMonthlyRevenue(),
        
        // Pagamentos por status
        this.getPaymentsByStatus()
      ]);

      // Calcular receita total
      const totalRevenue = contractsValueResult.data?.reduce((sum: number, contract: any) => sum + contract.value, 0) || 0;

      return {
        totalClients: clientsResult.count || 0,
        activeClients: activeClientsResult.count || 0,
        totalContracts: contractsResult.count || 0,
        activeContracts: activeContractsResult.count || 0,
        totalPayments: paymentsResult.count || 0,
        totalRevenue,
        pendingPayments: pendingPaymentsResult.count || 0,
        overduePayments: overduePaymentsResult.count || 0,
        monthlyRevenue,
        paymentsByStatus
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      throw error;
    }
  }

  /**
   * Obter receita mensal dos últimos 6 meses
   */
  private async getMonthlyRevenue(): Promise<Array<{ month: string; revenue: number }>> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: payments } = await supabase
        .from('payments')
        .select('amount, paid_at')
        .eq('status', 'paid')
        .gte('paid_at', sixMonthsAgo.toISOString());

      const monthlyData: { [key: string]: number } = {};

      payments?.forEach((payment: any) => {
        if (payment.paid_at) {
          const month = new Date(payment.paid_at).toLocaleDateString('pt-PT', { 
            year: 'numeric', 
            month: 'short' 
          });
          monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
        }
      });

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue,
      }));
    } catch (error) {
      console.error('Erro ao obter receita mensal:', error);
      return [];
    }
  }

  /**
   * Obter contagem de pagamentos por status
   */
  private async getPaymentsByStatus(): Promise<Array<{ status: string; count: number }>> {
    try {
      // Forçar uma nova consulta sem cache
      const { data: payments, error } = await supabase
        .from('payments')
        .select('status, due_date')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!payments) return [];

      const today = new Date();
      const statusCount: { [key: string]: number } = {};

      payments.forEach((payment: any) => {
        let status = payment.status;
        
        // Se o pagamento está pendente e passou da data de vencimento, considerar como atrasado
        if (status === 'pending' && payment.due_date) {
          const dueDate = new Date(payment.due_date);
          
          if (dueDate < today) {
            status = 'overdue';
          }
          // Se não passou da data de vencimento, mantém como 'pending'
        }
        
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      // Garantir que todos os status principais existam no resultado
      const result = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count,
      }));

      // Adicionar status com count 0 se não existirem
      const allStatuses = ['paid', 'pending', 'overdue', 'failed'];
      allStatuses.forEach(status => {
        if (!result.find(item => item.status === status)) {
          result.push({ status, count: 0 });
        }
      });

      return result;
    } catch (error) {
      console.error('Erro ao obter pagamentos por status:', error);
      return [];
    }
  }
}