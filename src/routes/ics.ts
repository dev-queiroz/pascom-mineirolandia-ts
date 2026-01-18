import { Router } from 'express';
import * as icsController from '../controllers/icsController';

const router = Router();

router.get('/', icsController.getICS);

export default router;