import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPlanSchema, updatePlanSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', PlanController.getPlans);
router.post('/', validate({ body: createPlanSchema }), PlanController.createPlan);
router.get('/:id', PlanController.getPlanById);
router.patch('/:id', validate({ body: updatePlanSchema }), PlanController.updatePlan);
router.delete('/:id', PlanController.deletePlan);
router.post('/:id/duplicate', PlanController.duplicatePlan);

export default router;
