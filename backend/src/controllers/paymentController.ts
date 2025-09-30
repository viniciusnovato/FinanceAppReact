import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  getAllPayments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payments = await this.paymentService.getAllPayments();
      
      res.status(200).json({
        success: true,
        message: 'Payments retrieved successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPaymentsPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await this.paymentService.getAllPaymentsPaginated({ page, limit });
      
      res.status(200).json({
        success: true,
        message: 'Paginated payments retrieved successfully',
        data: {
          data: result.data,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPreviousPage
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.getPaymentById(id);
      
      res.status(200).json({
        success: true,
        message: 'Payment retrieved successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentsByContractId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { contractId } = req.params;
      const payments = await this.paymentService.getPaymentsByContractId(contractId);
      
      res.status(200).json({
        success: true,
        message: 'Payments retrieved successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentsByContractIdPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { contractId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await this.paymentService.getPaymentsByContractIdPaginated(contractId, { page, limit });
      
      res.status(200).json({
        success: true,
        message: 'Paginated payments by contract retrieved successfully',
        data: {
          data: result.data,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPreviousPage
        }
      });
    } catch (error) {
      next(error);
    }
  };

  createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentData = req.body;
      const payment = await this.paymentService.createPayment(paymentData);
      
      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const paymentData = req.body;
      const payment = await this.paymentService.updatePayment(id, paymentData);
      
      res.status(200).json({
        success: true,
        message: 'Payment updated successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  deletePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.paymentService.deletePayment(id);
      
      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentsByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.params;
      const payments = await this.paymentService.getPaymentsByStatus(status as any);
      
      res.status(200).json({
        success: true,
        message: 'Payments retrieved successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  };

  getOverduePayments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payments = await this.paymentService.getOverduePayments();
      
      res.status(200).json({
        success: true,
        message: 'Overdue payments retrieved successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  };

  markPaymentAsPaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.markPaymentAsPaid(id);
      
      res.status(200).json({
        success: true,
        message: 'Payment marked as paid successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentStatistics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statistics = await this.paymentService.getPaymentStatistics();
      
      res.status(200).json({
        success: true,
        message: 'Payment statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  };
}