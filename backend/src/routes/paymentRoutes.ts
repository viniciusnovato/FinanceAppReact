import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const paymentController = new PaymentController();

// All payment routes require authentication
router.use(authenticateToken);

// Payment CRUD routes
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

// Additional routes for filtering and actions
router.get('/contract/:contractId', paymentController.getPaymentsByContractId);
router.get('/status/:status', paymentController.getPaymentsByStatus);
router.get('/overdue/list', paymentController.getOverduePayments);
router.patch('/:id/mark-paid', paymentController.markPaymentAsPaid);

// Statistics route
router.get('/statistics/summary', paymentController.getPaymentStatistics);

export default router;