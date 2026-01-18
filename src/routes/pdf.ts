import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as pdfController from '../controllers/pdfController';

const router = Router();

router.get('/scale', authenticate, pdfController.generateScalePDF);

export default router;