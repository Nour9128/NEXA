import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiChatSchema, aiOrganizeSchema, aiExtractSchema } from '../validators/index.js';

const router = Router();

router.get('/status', AIController.getStatus);

router.use(authenticate);

router.post('/chat', validate({ body: aiChatSchema }), AIController.chat);
router.post('/organize', validate({ body: aiOrganizeSchema }), AIController.organize);
router.post('/extract', validate({ body: aiExtractSchema }), AIController.extract);
router.get('/conversations', AIController.getConversations);
router.get('/conversations/:id', AIController.getConversationById);

export default router;
