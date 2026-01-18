import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as eventController from '../controllers/eventController';

const router = Router();

router.get('/', authenticate, eventController.getEvents);
router.post('/', authenticate, isAdmin, eventController.createEvent);

export default router;