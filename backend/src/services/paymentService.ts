import { PaymentRepository, PaginationOptions, PaginatedResult, PaymentFilters } from '../repositories/paymentRepository';
import { ContractRepository } from '../repositories/contractRepository';
import { Payment } from '../models';
import { createError } from '../middlewares/errorHandler';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private contractRepository: ContractRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.contractRepository = new ContractRepository();
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.findAll();
  }

  async getAllPaymentsPaginated(options: PaginationOptions = {}, filters: PaymentFilters = {}): Promise<PaginatedResult<Payment>> {
    return this.paymentRepository.findAllPaginated(options, filters);
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw createError('Payment not found', 404);
    }
    return payment;
  }

  async getPaymentsByContractId(contractId: string): Promise<Payment[]> {
    // Verify contract exists
    const contract = await this.contractRepository.findById(contractId);
    if (!contract) {
      throw createError('Contract not found', 404);
    }

    return this.paymentRepository.findByContractId(contractId);
  }

  async getPaymentsByContractIdPaginated(contractId: string, options: PaginationOptions = {}, filters: PaymentFilters = {}): Promise<PaginatedResult<Payment>> {
    // Verify contract exists
    const contract = await this.contractRepository.findById(contractId);
    if (!contract) {
      throw createError('Contract not found', 404);
    }

    return this.paymentRepository.findByContractIdPaginated(contractId, options, filters);
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    // Validate required fields
    if (!paymentData.contract_id || !paymentData.amount || !paymentData.due_date) {
      throw createError('Contract ID, amount, and due date are required', 400);
    }

    // Validate amount is positive
    if (paymentData.amount <= 0) {
      throw createError('Payment amount must be positive', 400);
    }

    // Verify contract exists
    const contract = await this.contractRepository.findById(paymentData.contract_id);
    if (!contract) {
      throw createError('Contract not found', 404);
    }

    // Validate due date is not in the past (unless it's intentional)
    const dueDate = new Date(paymentData.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today && paymentData.status === 'pending') {
      // If due date is in the past and status is pending, mark as overdue
      paymentData.status = 'overdue';
    }

    // Clean up empty string fields to prevent enum errors
    const cleanedData = {
      ...paymentData,
      notes: paymentData.notes === '' ? undefined : paymentData.notes,
    };

    return this.paymentRepository.create(cleanedData);
  }

  async updatePayment(id: string, paymentData: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>): Promise<Payment> {
    // Check if payment exists
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw createError('Payment not found', 404);
    }

    // Validate amount if being updated
    if (paymentData.amount !== undefined && paymentData.amount <= 0) {
      throw createError('Payment amount must be positive', 400);
    }

    // Verify contract exists if contract_id is being updated
    if (paymentData.contract_id) {
      const contract = await this.contractRepository.findById(paymentData.contract_id);
      if (!contract) {
        throw createError('Contract not found', 404);
      }
    }

    // If marking as paid, set paid_date
    if (paymentData.status === 'paid' && !paymentData.paid_date) {
      paymentData.paid_date = new Date();
    }

    // Clean up empty string fields to prevent enum errors
    const cleanedData = {
      ...paymentData,
      notes: paymentData.notes === '' ? undefined : paymentData.notes,
    };

    const updatedPayment = await this.paymentRepository.update(id, cleanedData);
    if (!updatedPayment) {
      throw createError('Failed to update payment', 500);
    }

    return updatedPayment;
  }

  async deletePayment(id: string): Promise<void> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw createError('Payment not found', 404);
    }

    await this.paymentRepository.delete(id);
  }

  async getPaymentsByStatus(status: Payment['status']): Promise<Payment[]> {
    return this.paymentRepository.findByStatus(status);
  }

  async getOverduePayments(): Promise<Payment[]> {
    return this.paymentRepository.findOverduePayments();
  }

  async markPaymentAsPaid(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status === 'paid') {
      throw createError('Payment is already marked as paid', 400);
    }

    const updatedPayment = await this.paymentRepository.markAsPaid(id);
    if (!updatedPayment) {
      throw createError('Failed to mark payment as paid', 500);
    }

    return updatedPayment;
  }

  async updateOverduePayments(): Promise<void> {
    // This method can be called periodically to update overdue payments
    const pendingPayments = await this.paymentRepository.findByStatus('pending');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const payment of pendingPayments) {
      const dueDate = new Date(payment.due_date);
      if (dueDate < today) {
        await this.paymentRepository.update(payment.id, { status: 'overdue' });
      }
    }
  }

  async getPaymentStatistics() {
    const allPayments = await this.paymentRepository.findAll();
    
    const totalPayments = allPayments.length;
    const paidPayments = allPayments.filter(p => p.status === 'paid');
    const pendingPayments = allPayments.filter(p => p.status === 'pending');
    const overduePayments = allPayments.filter(p => p.status === 'overdue');

    const totalAmount = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const paidAmount = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const overdueAmount = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalPayments,
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      overduePayments: overduePayments.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
    };
  }

  async processManualPayment(paymentId: string, amount: number): Promise<{
    payment: Payment;
    newPayment?: Payment;
    contractUpdated?: boolean;
    message: string;
  }> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status === 'paid') {
      throw createError('Payment is already marked as paid', 400);
    }

    const originalAmount = payment.amount;
    
    // Caso 1: Pagamento exato
    if (amount === originalAmount) {
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: 'paid',
        paid_amount: amount
      });
      
      return {
        payment: updatedPayment!,
        message: 'Payment completed successfully'
      };
    }
    
    // Caso 2: Pagamento parcial
    if (amount < originalAmount) {
      const remainingAmount = originalAmount - amount;
      
      // Atualizar pagamento atual como pago parcialmente
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: 'paid',
        paid_amount: amount
      });
      
      // Criar nova parcela para o saldo devedor
      const newPayment = await this.paymentRepository.create({
        contract_id: payment.contract_id,
        amount: remainingAmount,
        due_date: payment.due_date, // Mesma data de vencimento
        status: 'pending',
        payment_type: 'normalPayment',
        paid_amount: 0
      });
      
      return {
        payment: updatedPayment!,
        newPayment,
        message: `Partial payment processed. New installment created for remaining amount: R$ ${remainingAmount.toFixed(2)}`
      };
    }
    
    // Caso 3: Pagamento excedente
    if (amount > originalAmount) {
      const excessAmount = amount - originalAmount;
      
      // Atualizar pagamento atual como pago
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: 'paid',
        paid_amount: amount
      });
      
      // Atualizar positive_balance do contrato
      const contract = await this.contractRepository.findById(payment.contract_id);
      if (contract) {
        const currentBalance = contract.positive_balance || 0;
        await this.contractRepository.update(payment.contract_id, {
          positive_balance: currentBalance + excessAmount
        });
      }
      
      return {
        payment: updatedPayment!,
        contractUpdated: true,
        message: `Payment completed with excess amount. R$ ${excessAmount.toFixed(2)} added to contract balance`
      };
    }

    throw createError('Invalid payment amount', 400);
  }
}