import { Request, Response, NextFunction } from 'express';
import { ContractService } from '../services/contractService';

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  getAllContracts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contracts = await this.contractService.getAllContracts();
      
      res.status(200).json({
        success: true,
        message: 'Contracts retrieved successfully',
        data: contracts,
      });
    } catch (error) {
      next(error);
    }
  };

  getContractById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const contract = await this.contractService.getContractById(id);
      
      res.status(200).json({
        success: true,
        message: 'Contract retrieved successfully',
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  };

  getContractsByClientId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId } = req.params;
      const contracts = await this.contractService.getContractsByClientId(clientId);
      
      res.status(200).json({
        success: true,
        message: 'Contracts retrieved successfully',
        data: contracts,
      });
    } catch (error) {
      next(error);
    }
  };

  createContract = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contractData = req.body;
      const contract = await this.contractService.createContract(contractData);
      
      res.status(201).json({
        success: true,
        message: 'Contract created successfully',
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  };

  updateContract = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const contractData = req.body;
      const contract = await this.contractService.updateContract(id, contractData);
      
      res.status(200).json({
        success: true,
        message: 'Contract updated successfully',
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteContract = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.contractService.deleteContract(id);
      
      res.status(200).json({
        success: true,
        message: 'Contract deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getContractsByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.params;
      const contracts = await this.contractService.getContractsByStatus(status);
      
      res.status(200).json({
        success: true,
        message: 'Contracts retrieved successfully',
        data: contracts,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteContractPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.contractService.deleteContractPayments(id);
      
      res.status(200).json({
        success: true,
        message: 'Contract payments deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}