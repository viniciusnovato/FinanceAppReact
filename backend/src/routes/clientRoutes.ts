import { Router } from 'express';
import { ClientController } from '../controllers/clientController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const clientController = new ClientController();

// All client routes require authentication
router.use(authenticateToken);

// Client CRUD routes
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;