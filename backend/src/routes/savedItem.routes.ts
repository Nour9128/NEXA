import { Router } from 'express';
import { SavedItemController } from '../controllers/savedItem.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSavedItemSchema, updateSavedItemSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', SavedItemController.getSavedItems);
router.post('/', validate({ body: createSavedItemSchema }), SavedItemController.createSavedItem);
router.patch('/:id', validate({ body: updateSavedItemSchema }), SavedItemController.updateSavedItem);
router.delete('/:id', SavedItemController.deleteSavedItem);

export default router;
