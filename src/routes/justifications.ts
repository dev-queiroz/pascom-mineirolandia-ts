import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as justificationController from '../controllers/justificationController';

const router = Router();

router.post('/', authenticate, justificationController.createJustification);
router.get('/', authenticate, isAdmin, justificationController.getAllJustifications);

export default router;