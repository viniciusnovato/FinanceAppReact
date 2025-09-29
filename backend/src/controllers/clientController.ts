import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/clientService';

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  getAllClients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clients = await this.clientService.getAllClients();
      
      res.status(200).json({
        success: true,
        message: 'Clients retrieved successfully',
        data: clients,
      });
    } catch (error) {
      next(error);
    }
  };

  getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const client = await this.clientService.getClientById(id);
      
      res.status(200).json({
        success: true,
        message: 'Client retrieved successfully',
        data: client,
      });
    } catch (error) {
      next(error);
    }
  };

  createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientData = req.body;
      const client = await this.clientService.createClient(clientData);
      
      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: client,
      });
    } catch (error) {
      next(error);
    }
  };

  updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const clientData = req.body;
      const client = await this.clientService.updateClient(id, clientData);
      
      res.status(200).json({
        success: true,
        message: 'Client updated successfully',
        data: client,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.clientService.deleteClient(id);
      
      res.status(200).json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}