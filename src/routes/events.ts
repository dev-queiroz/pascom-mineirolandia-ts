import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as eventController from '../controllers/eventController';

const router = Router();

router.get('/', authenticate, eventController.getEvents);
router.post('/', authenticate, isAdmin, eventController.createEvent);
router.post('/assign', authenticate, eventController.assignToSlot);
router.post('/remove', authenticate, eventController.removeFromSlot);

export default router;