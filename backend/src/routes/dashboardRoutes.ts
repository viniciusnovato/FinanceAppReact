import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const dashboardController = new DashboardController();

// GET /api/dashboard/stats - Obter estatísticas do dashboard
router.get('/stats', dashboardController.getStats);

export default router;