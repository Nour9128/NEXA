import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/me', UserController.getMe);
router.patch('/me', validate({ body: updateProfileSchema }), UserController.updateMe);
router.post('/change-password', UserController.changePassword);
router.get('/export', UserController.exportData);
router.delete('/me', UserController.deleteMe);

export default router;
