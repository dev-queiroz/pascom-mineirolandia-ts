import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/', authenticate, isAdmin, dashboardController.getDashboard);

export default router;