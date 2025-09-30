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
      // Obter total de clientes
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Obter clientes ativos
      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      // Obter total de contratos
      const { count: totalContracts } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true });

      // Obter contratos ativos
      const { count: activeContracts } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      // Obter total de pagamentos
      const { count: totalPayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });

      // Obter receita total (pagamentos pagos)
      const { data: paidPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid');

      const totalRevenue = paidPayments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;

      // Obter pagamentos pendentes
      const { count: pendingPayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Obter pagamentos em atraso
      const { count: overduePayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

      // Obter receita mensal dos últimos 6 meses
      const monthlyRevenue = await this.getMonthlyRevenue();

      // Obter pagamentos por status
      const paymentsByStatus = await this.getPaymentsByStatus();

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        totalContracts: totalContracts || 0,
        activeContracts: activeContracts || 0,
        totalPayments: totalPayments || 0,
        totalRevenue,
        pendingPayments: pendingPayments || 0,
        overduePayments: overduePayments || 0,
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
          const month = new Date(payment.paid_at).toLocaleDateString('pt-BR', { 
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
      const allStatuses = ['paid', 'pending', 'overdue', 'cancelled'];
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