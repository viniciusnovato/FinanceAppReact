import { supabase } from '../config/database';

export interface DashboardStats {
  totalClients: number;
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
   * Obter estatísticas completas do dashboard
   */
  async getStats(): Promise<DashboardStats> {
    try {
      // Obter total de clientes
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Obter total de contratos
      const { count: totalContracts } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true });

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

      // Obter contratos ativos
      const { count: activeContracts } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Obter receita mensal dos últimos 6 meses
      const monthlyRevenue = await this.getMonthlyRevenue();

      // Obter pagamentos por status
      const paymentsByStatus = await this.getPaymentsByStatus();

      return {
        totalClients: totalClients || 0,
        totalContracts: totalContracts || 0,
        activeContracts: activeContracts || 0,
        totalPayments: totalPayments || 0,
        totalRevenue,
        pendingPayments: pendingPayments || 0,
        overduePayments: overduePayments || 0,
        monthlyRevenue,
        paymentsByStatus,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      throw new Error('Não foi possível obter as estatísticas do dashboard');
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
      const { data: payments } = await supabase
        .from('payments')
        .select('status');

      const statusCount: { [key: string]: number } = {};

      payments?.forEach((payment: any) => {
        statusCount[payment.status] = (statusCount[payment.status] || 0) + 1;
      });

      return Object.entries(statusCount).map(([status, count]) => ({
        status,
        count,
      }));
    } catch (error) {
      console.error('Erro ao obter pagamentos por status:', error);
      return [];
    }
  }
}