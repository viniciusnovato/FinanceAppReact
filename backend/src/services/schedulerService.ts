import * as cron from 'node-cron';
import { PaymentService } from './paymentService';

export class SchedulerService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Inicia todos os schedulers
   */
  public startSchedulers(): void {
    this.startOverduePaymentsScheduler();
    console.log('📅 Schedulers iniciados com sucesso');
  }

  /**
   * Scheduler para atualizar pagamentos atrasados
   * Executa todos os dias às 00:01 (1 minuto após meia-noite)
   */
  private startOverduePaymentsScheduler(): void {
    cron.schedule('1 0 * * *', async () => {
      try {
        console.log('🔄 Executando atualização automática de pagamentos atrasados...');
        await this.paymentService.updateOverduePayments();
        console.log('✅ Atualização de pagamentos atrasados concluída');
      } catch (error) {
        console.error('❌ Erro ao atualizar pagamentos atrasados:', error);
      }
    }, {
      timezone: 'Europe/Lisbon' // Ajuste conforme necessário
    });

    console.log('📅 Scheduler de pagamentos atrasados configurado (executa diariamente às 00:01)');
  }

  /**
   * Para todos os schedulers (útil para testes ou shutdown)
   */
  public stopSchedulers(): void {
    cron.getTasks().forEach((task) => {
      task.stop();
    });
    console.log('⏹️ Todos os schedulers foram parados');
  }
}