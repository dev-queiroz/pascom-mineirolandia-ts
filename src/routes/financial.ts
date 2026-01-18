import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import * as financialController from '../controllers/financialController';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas jpg, png e pdf'));
        }
    }
});

const router = Router();

router.post('/entry', authenticate, upload.single('comprovante'), financialController.addEntry);
router.post('/exit', authenticate, isAdmin, upload.single('comprovante'), financialController.addExit);
router.get('/pendencias', authenticate, isAdmin, financialController.getPendencias);
router.patch('/confirm/:id', authenticate, isAdmin, financialController.confirmPendencia);
router.delete('/delete/:id', authenticate, isAdmin, financialController.deletePendencia);
router.get('/resumo', authenticate, isAdmin, financialController.getResumo);

export default router;