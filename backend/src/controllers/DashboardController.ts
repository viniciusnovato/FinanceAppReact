import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * Obter estatísticas do dashboard
   */
  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.dashboardService.getStats();
      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível obter as estatísticas do dashboard'
      });
    }
  };
}