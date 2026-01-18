import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as financialController from '../controllers/financialController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.post('/entry', authenticate, upload.single('comprovante'), financialController.addEntry);
router.post('/exit', authenticate, isAdmin, upload.single('comprovante'), financialController.addExit);
router.get('/pendencias', authenticate, isAdmin, financialController.getPendencias);
router.patch('/confirm/:id', authenticate, isAdmin, financialController.confirmPendencia);
router.delete('/delete/:id', authenticate, isAdmin, financialController.deletePendencia);
router.get('/resumo', authenticate, isAdmin, financialController.getResumo);

export default router;